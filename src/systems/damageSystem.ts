import type { System, World } from "../core/ecs/types.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { DamageDealtEvent } from "../core/events/gameEvents.js";
import type { HealthComponent } from "../components/health.js";
import type { EnemyComponent } from "../components/enemy.js";
import type { PlayerComponent } from "../components/player.js";
import type { RenderableComponent } from "../components/renderable.js";
import type { GameConfig } from "../config/defaults.js";

export class DamageSystem implements System {
  readonly name = "DamageSystem";
  private pendingDamage: DamageDealtEvent[] = [];

  constructor(
    private events: EventBus,
    private config: GameConfig,
  ) {
    this.events.on("damageDealt", (event) => {
      this.pendingDamage.push(event as DamageDealtEvent);
    });
  }

  update(world: World): void {
    for (const event of this.pendingDamage) {
      const health = world.getComponent<HealthComponent>(event.target, "health");
      if (!health) continue;

      const player = world.getComponent<PlayerComponent>(event.target, "player");
      if (player && player.invincibleTicks > 0) {
        continue;
      }

      health.current = Math.max(0, health.current - event.amount);

      const enemy = world.getComponent<EnemyComponent>(event.target, "enemy");
      if (enemy) {
        enemy.hitFlashRemaining = enemy.hitFlashDuration;
        this.events.emit({
          type: "combatLog",
          message: `Hit ${enemy.enemyId} for ${event.amount}!`,
        });
      }

      if (player) {
        player.invincibleTicks = Math.max(player.invincibleTicks, 2);
        const ren = world.getComponent<RenderableComponent>(event.target, "renderable");
        if (ren) {
          ren.fg = "whiteBright";
        }
      }

      this.events.emit({
        type: "screenShake",
        intensity: this.config.combat.screenShakeOnHit,
        duration: 1,
      });
    }
    this.pendingDamage = [];
  }
}
