import type { GameEngine } from "../core/engine/gameEngine.js";
import type { DataRegistry } from "../core/data/registry.js";
import { createPosition } from "../components/position.js";
import { createVelocity } from "../components/velocity.js";
import { createDirection } from "../components/direction.js";
import { createHealth } from "../components/health.js";
import { createRenderable, RenderLayer } from "../components/renderable.js";
import { createPlayer } from "../components/player.js";
import { createHitbox } from "../components/hitbox.js";
import { createUltimateCharge } from "../components/ultimateCharge.js";
import { createAbilitySet } from "../components/abilitySet.js";
import { createStatusEffect } from "../components/statusEffect.js";
import { InputSystem } from "./inputSystem.js";
import { MovementSystem } from "./movementSystem.js";
import { AISystem } from "./aiSystem.js";
import { AbilitySystem } from "./abilitySystem.js";
import { CooldownSystem } from "./cooldownSystem.js";
import { CollisionSystem } from "./collisionSystem.js";
import { DamageSystem } from "./damageSystem.js";
import { HealthSystem } from "./healthSystem.js";
import { ChargeSystem } from "./chargeSystem.js";
import { StatusEffectSystem } from "./statusEffectSystem.js";
import { AreaEffectSystem } from "./areaEffectSystem.js";
import { EffectSystem } from "./effectSystem.js";
import { LifetimeSystem } from "./lifetimeSystem.js";
import { CleanupSystem } from "./cleanupSystem.js";

export interface CombatSetupOptions {
  ability1: string;
  ability2: string;
  ultimate: string;
}

const DEFAULT_LOADOUT: CombatSetupOptions = {
  ability1: "fireBolt",
  ability2: "frostWave",
  ultimate: "novaCataclysm",
};

export function setupCombat(
  engine: GameEngine,
  registry: DataRegistry,
  loadout: CombatSetupOptions = DEFAULT_LOADOUT,
): void {
  const config = engine.getConfig();
  const world = engine.world;

  const a1 = registry.getAbility(loadout.ability1);
  const a2 = registry.getAbility(loadout.ability2);

  const player = world.createEntity();
  world.addComponent(player, createPosition(
    Math.floor(config.grid.width / 2),
    Math.floor(config.grid.height / 2),
  ));
  world.addComponent(player, createVelocity(0, 0));
  world.addComponent(player, createDirection("right"));
  world.addComponent(player, createHealth(config.player.hp));
  world.addComponent(player, createRenderable(
    config.player.char,
    config.player.color,
    "",
    RenderLayer.PLAYER,
  ));
  world.addComponent(player, createPlayer());
  world.addComponent(player, createHitbox(1, 1));
  world.addComponent(player, createUltimateCharge(config.player.ultimateChargeMax));
  world.addComponent(player, createAbilitySet(
    loadout.ability1,
    a1?.cooldown ?? 3,
    loadout.ability2,
    a2?.cooldown ?? 5,
    loadout.ultimate,
  ));
  world.addComponent(player, createStatusEffect());

  engine.registerSystem(new InputSystem(engine.input, engine.events, config));
  engine.registerSystem(new AISystem(engine.events, registry));
  engine.registerSystem(new AbilitySystem(engine.events, registry, config));
  engine.registerSystem(new CooldownSystem());
  engine.registerSystem(new MovementSystem(config));
  engine.registerSystem(new CollisionSystem(engine.events));
  engine.registerSystem(new DamageSystem(engine.events, config));
  engine.registerSystem(new HealthSystem(engine.events, config));
  engine.registerSystem(new ChargeSystem(engine.events, registry));
  engine.registerSystem(new StatusEffectSystem(engine.events));
  engine.registerSystem(new AreaEffectSystem(engine.events));
  engine.registerSystem(new EffectSystem(engine.events, registry));
  engine.registerSystem(new LifetimeSystem());
  engine.registerSystem(new CleanupSystem(config));
}
