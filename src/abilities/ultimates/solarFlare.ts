import type { World, EntityId } from "../../core/ecs/types.js";
import type { UltimateData } from "../../core/data/schemas.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import type { StatusEffectComponent } from "../../components/statusEffect.js";
import { createPosition } from "../../components/position.js";
import { createRenderable, RenderLayer } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { addStatusEffect } from "../../components/statusEffect.js";

export function executeSolarFlare(
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
        if (Math.abs(dx) + Math.abs(dy) <= phase.radius) {
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
  }

  const enemies = world.query("position", "health", "enemy");
  for (const eid of enemies) {
    events.emit({
      type: "damageDealt",
      source: casterEntity,
      target: eid,
      amount: ultData.damage,
      abilityId: ultData.id,
    });

    if (ultData.statusEffect) {
      const statusComp = world.getComponent<StatusEffectComponent>(eid, "statusEffect");
      if (statusComp) {
        addStatusEffect(statusComp, {
          effectType: ultData.statusEffect.effectType,
          duration: ultData.statusEffect.duration,
          magnitude: ultData.statusEffect.magnitude,
          sourceId: casterEntity,
        });
      }
    }
  }
}
