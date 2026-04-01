import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { loadJsonDirectory, loadJsonFile } from "./loader.js";
import {
  AbilitySchema,
  UltimateSchema,
  EnemySchema,
  WaveSchema,
  EffectSchema,
  GameConfigSchema,
  BalanceConfigSchema,
  type AbilityData,
  type UltimateData,
  type EnemyData,
  type WaveData,
  type EffectData,
  type BalanceConfig,
} from "./schemas.js";
import type { GameConfig } from "../../config/defaults.js";
import { DEFAULT_CONFIG } from "../../config/defaults.js";
import { logger } from "../../utils/logger.js";

function resolveDataDir(): string {
  const thisFile = fileURLToPath(import.meta.url);
  const srcDir = dirname(dirname(dirname(thisFile)));
  const projectRoot = dirname(srcDir);
  return join(projectRoot, "data");
}

export class DataRegistry {
  private abilities = new Map<string, AbilityData>();
  private ultimates = new Map<string, UltimateData>();
  private enemies = new Map<string, EnemyData>();
  private waves = new Map<string, WaveData>();
  private effects = new Map<string, EffectData>();
  private gameConfig: GameConfig = DEFAULT_CONFIG;
  private balanceConfig: BalanceConfig = { damageMultiplier: 1, chargeRateMultiplier: 1, enemySpeedMultiplier: 1, enemyDamageMultiplier: 1 };

  load(dataDir?: string): void {
    const dir = dataDir ?? resolveDataDir();
    logger.info(`Loading data from: ${dir}`);

    const abilityDir = join(dir, "abilities");
    if (existsSync(abilityDir)) {
      for (const data of loadJsonDirectory(abilityDir, AbilitySchema)) {
        this.abilities.set(data.id, data);
      }
    }

    const ultimateDir = join(dir, "ultimates");
    if (existsSync(ultimateDir)) {
      for (const data of loadJsonDirectory(ultimateDir, UltimateSchema)) {
        this.ultimates.set(data.id, data);
      }
    }

    const enemyDir = join(dir, "enemies");
    if (existsSync(enemyDir)) {
      for (const data of loadJsonDirectory(enemyDir, EnemySchema)) {
        this.enemies.set(data.id, data);
      }
    }

    const waveDir = join(dir, "waves");
    if (existsSync(waveDir)) {
      for (const data of loadJsonDirectory(waveDir, WaveSchema)) {
        this.waves.set(data.id, data);
      }
    }

    const effectDir = join(dir, "effects");
    if (existsSync(effectDir)) {
      for (const data of loadJsonDirectory(effectDir, EffectSchema)) {
        this.effects.set(data.id, data);
      }
    }

    const gameConfigPath = join(dir, "config", "game.json");
    if (existsSync(gameConfigPath)) {
      this.gameConfig = loadJsonFile(gameConfigPath, GameConfigSchema);
    }

    const balancePath = join(dir, "config", "balance.json");
    if (existsSync(balancePath)) {
      this.balanceConfig = loadJsonFile(balancePath, BalanceConfigSchema);
    }

    logger.info("Data registry loaded", {
      abilities: this.abilities.size,
      ultimates: this.ultimates.size,
      enemies: this.enemies.size,
      waves: this.waves.size,
      effects: this.effects.size,
    });
  }

  getAbility(id: string): AbilityData | undefined {
    return this.abilities.get(id);
  }

  getUltimate(id: string): UltimateData | undefined {
    return this.ultimates.get(id);
  }

  getEnemy(id: string): EnemyData | undefined {
    return this.enemies.get(id);
  }

  getWave(id: string): WaveData | undefined {
    return this.waves.get(id);
  }

  getEffect(id: string): EffectData | undefined {
    return this.effects.get(id);
  }

  getAllAbilities(): AbilityData[] {
    return [...this.abilities.values()];
  }

  getAllUltimates(): UltimateData[] {
    return [...this.ultimates.values()];
  }

  getAllEnemies(): EnemyData[] {
    return [...this.enemies.values()];
  }

  getWavesSorted(): WaveData[] {
    return [...this.waves.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  getGameConfig(): GameConfig {
    return this.gameConfig;
  }

  getBalanceConfig(): BalanceConfig {
    return this.balanceConfig;
  }
}

let globalRegistry: DataRegistry | null = null;

export function getRegistry(): DataRegistry {
  if (!globalRegistry) {
    globalRegistry = new DataRegistry();
    globalRegistry.load();
  }
  return globalRegistry;
}
