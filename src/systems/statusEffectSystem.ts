import type { System, World } from "../core/ecs/types.js";
import type { StatusEffectComponent } from "../components/statusEffect.js";
import type { HealthComponent } from "../components/health.js";
import type { EventBus } from "../core/events/eventBus.js";

export class StatusEffectSystem implements System {
  readonly name = "StatusEffectSystem";

  constructor(private events: EventBus) {}

  update(world: World): void {
    const entities = world.query("statusEffect");

    for (const id of entities) {
      const statusFx = world.getComponent<StatusEffectComponent>(id, "statusEffect")!;
      const toRemove: number[] = [];

      for (let i = 0; i < statusFx.effects.length; i++) {
        const effect = statusFx.effects[i];
        effect.duration--;

        if (effect.effectType === "dot") {
          const health = world.getComponent<HealthComponent>(id, "health");
          if (health) {
            const dotDamage = Math.ceil(effect.magnitude);
            health.current = Math.max(0, health.current - dotDamage);
          }
        }

        if (effect.duration <= 0) {
          toRemove.push(i);
        }
      }

      for (let i = toRemove.length - 1; i >= 0; i--) {
        statusFx.effects.splice(toRemove[i], 1);
      }
    }
  }
}
