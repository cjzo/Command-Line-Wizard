import type { World, EntityId } from "../../core/ecs/types.js";
import type { UltimateData } from "../../core/data/schemas.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import { createPosition } from "../../components/position.js";
import { createRenderable, RenderLayer } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { distance } from "../../utils/vector.js";

export function executeVoidCollapse(
  world: World,
  casterEntity: EntityId,
  ultData: UltimateData,
  events: EventBus,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return;

  const cx = Math.round(casterPos.x);
  const cy = Math.round(casterPos.y);

  for (const phase of ultData.phases) {
    for (let dy = -phase.radius; dy <= phase.radius; dy++) {
      for (let dx = -phase.radius; dx <= phase.radius; dx++) {
        const dist = Math.abs(dx) + Math.abs(dy);
        const isRing = dist >= phase.radius - 1 && dist <= phase.radius;
        if (!isRing) continue;

        const visual = world.createEntity();
        world.addComponent(visual, createPosition(cx + dx, cy + dy));
        world.addComponent(visual, createRenderable(
          phase.char,
          phase.color,
          "",
          RenderLayer.EFFECT_HIGH,
        ));
        world.addComponent(visual, createLifetime(phase.tick + 2));
      }
    }
  }

  const damageRadius = 5;
  const enemies = world.query("position", "health", "enemy");
  for (const eid of enemies) {
    const epos = world.getComponent<PositionComponent>(eid, "position")!;
    const dist = distance(epos, { x: cx, y: cy });
    if (dist <= damageRadius) {
      events.emit({
        type: "damageDealt",
        source: casterEntity,
        target: eid,
        amount: ultData.damage,
        abilityId: ultData.id,
      });
    }
  }
}
