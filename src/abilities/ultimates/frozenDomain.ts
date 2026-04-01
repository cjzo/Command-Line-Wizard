import type { World, EntityId } from "../../core/ecs/types.js";
import type { UltimateData } from "../../core/data/schemas.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import type { StatusEffectComponent } from "../../components/statusEffect.js";
import { createPosition } from "../../components/position.js";
import { createRenderable } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { createAreaEffect } from "../../components/areaEffect.js";
import { addStatusEffect } from "../../components/statusEffect.js";
import { RenderLayer } from "../../components/renderable.js";
import { distance } from "../../utils/vector.js";

export function executeFrozenDomain(
  world: World,
  casterEntity: EntityId,
  ultData: UltimateData,
  events: EventBus,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return;

  const cx = Math.round(casterPos.x);
  const cy = Math.round(casterPos.y);
  const persistent = ultData.persistent;
  const zoneRadius = persistent?.radius ?? 4;
  const zoneDuration = persistent?.durationTicks ?? 15;

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
            RenderLayer.EFFECT_LOW,
          ));
          world.addComponent(visual, createLifetime(phase.tick + 3));
        }
      }
    }
  }

  const zone = world.createEntity();
  world.addComponent(zone, createPosition(cx, cy));
  world.addComponent(zone, createRenderable(
    persistent?.char ?? "·",
    persistent?.color ?? "cyan",
    "",
    RenderLayer.EFFECT_LOW,
  ));
  world.addComponent(zone, createAreaEffect({
    shape: "circle",
    radius: zoneRadius,
    damage: persistent?.damagePerTick ?? 3,
    ticks: zoneDuration,
    ownerId: casterEntity,
    damagePerTick: true,
    statusEffect: ultData.statusEffect ? {
      effectType: ultData.statusEffect.effectType,
      duration: ultData.statusEffect.duration,
      magnitude: ultData.statusEffect.magnitude,
    } : undefined,
  }));
  world.addComponent(zone, createLifetime(zoneDuration));

  for (let dy = -zoneRadius; dy <= zoneRadius; dy++) {
    for (let dx = -zoneRadius; dx <= zoneRadius; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= zoneRadius && (Math.abs(dx) + Math.abs(dy) === zoneRadius)) {
        const border = world.createEntity();
        world.addComponent(border, createPosition(cx + dx, cy + dy));
        world.addComponent(border, createRenderable("*", "cyanBright", "", RenderLayer.EFFECT_LOW));
        world.addComponent(border, createLifetime(zoneDuration));
      }
    }
  }
}
