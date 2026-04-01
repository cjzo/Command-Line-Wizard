import React, { useState, useCallback, useEffect, useRef } from "react";
import { useInput, useApp, Box, Text } from "ink";
import { useGameEngine } from "./hooks/useGameEngine.js";
import { CombatScreen } from "./screens/CombatScreen.js";
import { MainMenu } from "./screens/MainMenu.js";
import { AbilitySelect } from "./screens/AbilitySelect.js";
import { DeathScreen } from "./screens/DeathScreen.js";
import { VictoryScreen } from "./screens/VictoryScreen.js";
import { HealthBar } from "./components/HealthBar.js";
import { UltimateBar } from "./components/UltimateBar.js";
import { AbilityDisplay } from "./components/AbilityDisplay.js";
import { CombatLog } from "./components/CombatLog.js";
import type { GameConfig } from "../config/defaults.js";
import { setupCombat } from "../systems/setupCombat.js";
import { DataRegistry } from "../core/data/registry.js";
import { WaveSpawner } from "../enemies/spawner.js";
import type { HealthComponent } from "../components/health.js";
import type { UltimateChargeComponent } from "../components/ultimateCharge.js";
import type { AbilitySetComponent } from "../components/abilitySet.js";
import type { EntityKilledEvent } from "../core/events/gameEvents.js";

type GameScreen = "menu" | "abilitySelect" | "combat" | "death" | "victory";

interface AppProps {
  config: GameConfig;
}

export const App: React.FC<AppProps> = ({ config }) => {
  const { exit } = useApp();
  const { engine, cells, tick } = useGameEngine(config);
  const [screen, setScreen] = useState<GameScreen>("menu");
  const [menuIndex, setMenuIndex] = useState(0);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [waveName, setWaveName] = useState("");
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [wavesCleared, setWavesCleared] = useState(0);
  const registryRef = useRef<DataRegistry | null>(null);
  const spawnerRef = useRef<WaveSpawner | null>(null);

  if (!registryRef.current) {
    registryRef.current = new DataRegistry();
    try {
      registryRef.current.load();
    } catch {
      // Silently fall back to defaults
    }
  }
  const registry = registryRef.current;

  const startCombat = useCallback((a1: string, a2: string, ult: string) => {
    engine.stop();
    engine.world.clear();
    engine.resetSystems();
    setupCombat(engine, registry, { ability1: a1, ability2: a2, ultimate: ult });

    const spawner = new WaveSpawner(registry, engine.events, config);
    spawnerRef.current = spawner;
    spawner.start();
    setWaveName(spawner.getCurrentWaveName());
    setEnemiesKilled(0);
    setWavesCleared(0);
    setCombatLog([]);
    engine.start();
    setScreen("combat");
  }, [engine, config, registry]);

  useEffect(() => {
    const unsubLog = engine.events.on("combatLog", (event) => {
      const e = event as { message: string };
      setCombatLog((prev) => [...prev.slice(-12), e.message]);
    });

    const unsubDeath = engine.events.on("playerDied", () => {
      engine.stop();
      setScreen("death");
    });

    const unsubKill = engine.events.on("entityKilled", () => {
      setEnemiesKilled((n) => n + 1);
    });

    const unsubWave = engine.events.on("waveComplete", () => {
      setWavesCleared((n) => n + 1);
      const spawner = spawnerRef.current;
      if (spawner && spawner.isComplete()) {
        engine.stop();
        setScreen("victory");
      } else if (spawner) {
        setWaveName(spawner.getCurrentWaveName());
      }
    });

    const unsubShake = engine.events.on("screenShake", (event) => {
      const e = event as { intensity: number };
      const dx = (Math.random() > 0.5 ? 1 : -1) * e.intensity;
      const dy = (Math.random() > 0.5 ? 1 : -1) * Math.min(e.intensity, 1);
      engine.renderer.setShakeOffset(dx, dy);
    });

    const unsubHitstop = engine.events.on("hitstop", (event) => {
      const e = event as { duration: number };
      engine.applyHitstop(e.duration);
    });

    return () => {
      unsubLog();
      unsubDeath();
      unsubKill();
      unsubWave();
      unsubShake();
      unsubHitstop();
    };
  }, [engine]);

  useEffect(() => {
    if (screen === "combat" && spawnerRef.current) {
      spawnerRef.current.update(engine.world);
    }
  }, [tick, screen, engine.world]);

  useInput((input, key) => {
    if (screen === "menu") {
      if (input === "w" || key.upArrow) setMenuIndex((i) => Math.max(0, i - 1));
      if (input === "s" || key.downArrow) setMenuIndex((i) => Math.min(1, i + 1));
      if (key.return) {
        if (menuIndex === 0) setScreen("abilitySelect");
        if (menuIndex === 1) exit();
      }
    }

    if (screen === "combat") {
      if (input === "w" || key.upArrow) engine.input.press("up");
      if (input === "s" || key.downArrow) engine.input.press("down");
      if (input === "a" || key.leftArrow) engine.input.press("left");
      if (input === "d" || key.rightArrow) engine.input.press("right");
      if (input === "j") engine.input.press("ability1");
      if (input === "k") engine.input.press("ability2");
      if (input === "l") engine.input.press("ultimate");
      if (input === " ") engine.input.press("dash");

      if (input === "q") {
        engine.stop();
        engine.world.clear();
        setScreen("menu");
      }
    }

    if (screen === "death" || screen === "victory") {
      if (key.return) {
        engine.world.clear();
        engine.stop();
        setScreen("menu");
      }
    }
  });

  if (screen === "menu") {
    return (
      <MainMenu
        onStart={() => setScreen("abilitySelect")}
        onQuit={() => exit()}
        selectedIndex={menuIndex}
      />
    );
  }

  if (screen === "abilitySelect") {
    return (
      <AbilitySelect
        abilities={registry.getAllAbilities()}
        ultimates={registry.getAllUltimates()}
        onConfirm={startCombat}
      />
    );
  }

  if (screen === "death") {
    return <DeathScreen tick={tick} enemiesKilled={enemiesKilled} />;
  }

  if (screen === "victory") {
    return (
      <VictoryScreen
        tick={tick}
        enemiesKilled={enemiesKilled}
        wavesCleared={wavesCleared}
      />
    );
  }

  let playerHP = 0;
  let playerMaxHP = 100;
  let ultCharge = 0;
  let ultMax = 100;
  let slot1Cd = 0;
  let slot1Max = 0;
  let slot2Cd = 0;
  let slot2Max = 0;
  let ultReady = false;
  let slot1Name = "---";
  let slot2Name = "---";
  let ultName = "---";

  const playerEntities = engine.world.query("player", "health", "ultimateCharge", "abilitySet");
  if (playerEntities.length > 0) {
    const pid = playerEntities[0];
    const health = engine.world.getComponent<HealthComponent>(pid, "health");
    const charge = engine.world.getComponent<UltimateChargeComponent>(pid, "ultimateCharge");
    const abilities = engine.world.getComponent<AbilitySetComponent>(pid, "abilitySet");

    if (health) { playerHP = health.current; playerMaxHP = health.max; }
    if (charge) { ultCharge = charge.current; ultMax = charge.max; }
    if (abilities) {
      slot1Cd = abilities.slot1.cooldownRemaining;
      slot1Max = abilities.slot1.cooldownMax;
      slot2Cd = abilities.slot2.cooldownRemaining;
      slot2Max = abilities.slot2.cooldownMax;
      ultReady = abilities.ultimate.ready;

      const a1 = registry.getAbility(abilities.slot1.abilityId);
      const a2 = registry.getAbility(abilities.slot2.abilityId);
      const u = registry.getUltimate(abilities.ultimate.ultimateId);
      slot1Name = a1?.name ?? abilities.slot1.abilityId;
      slot2Name = a2?.name ?? abilities.slot2.abilityId;
      ultName = u?.name ?? abilities.ultimate.ultimateId;
    }
  }

  return (
    <CombatScreen
      cells={cells}
      sidebarWidth={config.sidebar.width}
      sidebarContent={
        <Box flexDirection="column">
          <Text color="cyan" bold>{"─── " + waveName + " ───"}</Text>
          <Text> </Text>
          <HealthBar current={playerHP} max={playerMaxHP} />
          <UltimateBar current={ultCharge} max={ultMax} ready={ultReady} />
          <Text> </Text>
          <AbilityDisplay
            slot1={{ key: "J", name: slot1Name, cooldownRemaining: slot1Cd, cooldownMax: slot1Max }}
            slot2={{ key: "K", name: slot2Name, cooldownRemaining: slot2Cd, cooldownMax: slot2Max }}
            ultimate={{ key: "L", name: ultName, ready: ultReady }}
          />
          <Text> </Text>
          <CombatLog messages={combatLog} />
          <Text> </Text>
          <Text color="white">
            WASD:move J/K:atk L:ult Q:quit
          </Text>
        </Box>
      }
    />
  );
};
