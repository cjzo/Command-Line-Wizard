import type { World, EntityId } from "../../core/ecs/types.js";
import type { UltimateData } from "../../core/data/schemas.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import type { DirectionComponent } from "../../components/direction.js";
import { createPosition } from "../../components/position.js";
import { createRenderable } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { RenderLayer } from "../../components/renderable.js";
import { directionToVec } from "../../utils/direction.js";
import { distance } from "../../utils/vector.js";

export function executeThunderCollapse(
  world: World,
  casterEntity: EntityId,
  ultData: UltimateData,
  events: EventBus,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  const casterDir = world.getComponent<DirectionComponent>(casterEntity, "direction");
  if (!casterPos || !casterDir) return;

  const dirVec = directionToVec(casterDir.facing);
  const targetX = Math.round(casterPos.x + dirVec.x * 5);
  const targetY = Math.round(casterPos.y + dirVec.y * 5);

  for (const phase of ultData.phases) {
    for (let dy = -phase.radius; dy <= phase.radius; dy++) {
      for (let dx = -phase.radius; dx <= phase.radius; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= phase.radius) {
          const visual = world.createEntity();
          world.addComponent(visual, createPosition(targetX + dx, targetY + dy));
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
  }

  const maxRadius = Math.max(...ultData.phases.map((p) => p.radius));
  const enemies = world.query("position", "health", "enemy");
  for (const eid of enemies) {
    const epos = world.getComponent<PositionComponent>(eid, "position")!;
    const dist = distance(epos, { x: targetX, y: targetY });
    if (dist <= maxRadius) {
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
