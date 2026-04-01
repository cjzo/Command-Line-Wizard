import type { World } from "../core/ecs/types.js";
import type { WaveData } from "../core/data/schemas.js";
import type { DataRegistry } from "../core/data/registry.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { GameConfig } from "../config/defaults.js";
import { spawnEnemy } from "./enemyFactory.js";
import { rng } from "../utils/random.js";

function getRandomEdgePosition(width: number, height: number): { x: number; y: number } {
  const side = rng().nextInt(0, 3);
  switch (side) {
    case 0: return { x: rng().nextInt(0, width - 1), y: 0 };
    case 1: return { x: rng().nextInt(0, width - 1), y: height - 1 };
    case 2: return { x: 0, y: rng().nextInt(0, height - 1) };
    default: return { x: width - 1, y: rng().nextInt(0, height - 1) };
  }
}

export class WaveSpawner {
  private currentWaveIndex = 0;
  private waveTick = 0;
  private spawnedIndices = new Set<number>();
  private waves: WaveData[] = [];
  private active = false;

  constructor(
    private registry: DataRegistry,
    private events: EventBus,
    private config: GameConfig,
  ) {
    this.waves = registry.getWavesSorted();
  }

  start(): void {
    this.currentWaveIndex = 0;
    this.waveTick = 0;
    this.spawnedIndices.clear();
    this.active = true;
  }

  isActive(): boolean {
    return this.active;
  }

  getCurrentWaveName(): string {
    const wave = this.waves[this.currentWaveIndex];
    return wave?.name ?? "";
  }

  update(world: World): void {
    if (!this.active || this.currentWaveIndex >= this.waves.length) return;

    const wave = this.waves[this.currentWaveIndex];
    this.waveTick++;

    for (let i = 0; i < wave.spawns.length; i++) {
      if (this.spawnedIndices.has(i)) continue;
      const spawn = wave.spawns[i];

      if (this.waveTick >= spawn.tick) {
        this.spawnedIndices.add(i);
        const enemyData = this.registry.getEnemy(spawn.enemyId);
        if (!enemyData) continue;

        for (let c = 0; c < spawn.count; c++) {
          let pos: { x: number; y: number };

          if (spawn.positions === "random_edge") {
            pos = getRandomEdgePosition(this.config.grid.width, this.config.grid.height);
          } else if (spawn.positions === "fixed" && spawn.fixedPositions?.[c]) {
            pos = spawn.fixedPositions[c];
          } else {
            pos = {
              x: rng().nextInt(1, this.config.grid.width - 2),
              y: rng().nextInt(1, this.config.grid.height - 2),
            };
          }

          spawnEnemy(world, enemyData, pos.x, pos.y);
        }

        this.events.emit({
          type: "combatLog",
          message: `${enemyData.name} x${spawn.count} appeared!`,
        });
      }
    }

    const allSpawned = this.spawnedIndices.size === wave.spawns.length;
    if (allSpawned && wave.clearCondition === "all_dead") {
      const livingEnemies = world.query("enemy", "health");
      if (livingEnemies.length === 0) {
        this.events.emit({
          type: "waveComplete",
          waveNumber: this.currentWaveIndex + 1,
        });
        this.events.emit({
          type: "combatLog",
          message: `Wave ${this.currentWaveIndex + 1} cleared!`,
        });
        this.currentWaveIndex++;
        this.waveTick = 0;
        this.spawnedIndices.clear();

        if (this.currentWaveIndex >= this.waves.length) {
          this.active = false;
        }
      }
    }
  }

  isComplete(): boolean {
    return this.currentWaveIndex >= this.waves.length && !this.active;
  }
}
