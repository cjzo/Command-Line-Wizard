import type { System, World } from "../core/ecs/types.js";
import type { HealthComponent } from "../components/health.js";
import type { EnemyComponent } from "../components/enemy.js";
import type { PlayerComponent } from "../components/player.js";
import type { RenderableComponent } from "../components/renderable.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { GameConfig } from "../config/defaults.js";
import { createLifetime } from "../components/lifetime.js";

const DEATH_CHARS = ["✦", "✕", "※", "⊹"];

export class HealthSystem implements System {
  readonly name = "HealthSystem";

  constructor(
    private events: EventBus,
    private config: GameConfig,
  ) {}

  update(world: World): void {
    const entities = world.query("health");

    for (const id of entities) {
      const health = world.getComponent<HealthComponent>(id, "health")!;
      if (health.current > 0) continue;

      if (world.hasComponent(id, "player")) {
        this.events.emit({ type: "playerDied" });
        continue;
      }

      if (world.hasComponent(id, "enemy")) {
        const players = world.query("player");
        const killerId = players[0] ?? 0;

        this.events.emit({
          type: "entityKilled",
          entity: id,
          killedBy: killerId,
        });
        this.events.emit({
          type: "hitstop",
          duration: this.config.combat.hitstopOnKill,
        });

        const ren = world.getComponent<RenderableComponent>(id, "renderable");
        if (ren) {
          ren.char = DEATH_CHARS[Math.floor(Math.random() * DEATH_CHARS.length)];
          ren.fg = "whiteBright";
        }

        for (const comp of ["enemy", "health", "velocity", "ai", "hitbox"]) {
          world.removeComponent(id, comp);
        }
        world.addComponent(id, createLifetime(5));
      }
    }
  }
}
