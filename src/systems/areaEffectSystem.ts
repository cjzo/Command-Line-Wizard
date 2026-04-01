import type { System, World } from "../core/ecs/types.js";
import type { AreaEffectComponent } from "../components/areaEffect.js";
import type { PositionComponent } from "../components/position.js";
import type { StatusEffectComponent } from "../components/statusEffect.js";
import type { EventBus } from "../core/events/eventBus.js";
import { addStatusEffect } from "../components/statusEffect.js";
import { distance } from "../utils/vector.js";

export class AreaEffectSystem implements System {
  readonly name = "AreaEffectSystem";

  constructor(private events: EventBus) {}

  update(world: World): void {
    const areas = world.query("areaEffect", "position");

    for (const areaId of areas) {
      const area = world.getComponent<AreaEffectComponent>(areaId, "areaEffect")!;
      const areaPos = world.getComponent<PositionComponent>(areaId, "position")!;

      area.ticksRemaining--;

      if (area.damagePerTick) {
        const enemies = world.query("position", "health", "enemy");
        for (const eid of enemies) {
          const epos = world.getComponent<PositionComponent>(eid, "position")!;
          const dist = distance(epos, areaPos);

          if (dist <= area.radius) {
            if (!area.hitEntities.has(eid) || area.damagePerTick) {
              area.hitEntities.add(eid);

              this.events.emit({
                type: "damageDealt",
                source: area.ownerId,
                target: eid,
                amount: area.damage,
                abilityId: "areaEffect",
              });

              if (area.statusEffect) {
                const statusFx = world.getComponent<StatusEffectComponent>(eid, "statusEffect");
                if (statusFx) {
                  addStatusEffect(statusFx, {
                    effectType: area.statusEffect.effectType,
                    duration: area.statusEffect.duration,
                    magnitude: area.statusEffect.magnitude,
                    sourceId: area.ownerId,
                  });
                }
              }
            }
          }
        }
      }

      if (area.ticksRemaining <= 0) {
        world.destroyEntity(areaId);
      }
    }
  }
}
