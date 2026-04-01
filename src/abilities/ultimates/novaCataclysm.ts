import type { World, EntityId } from "../../core/ecs/types.js";
import type { UltimateData } from "../../core/data/schemas.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import { createPosition } from "../../components/position.js";
import { createRenderable } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { createAreaEffect } from "../../components/areaEffect.js";
import { RenderLayer } from "../../components/renderable.js";

function getCirclePositions(cx: number, cy: number, radius: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= radius) {
        positions.push({ x: cx + dx, y: cy + dy });
      }
    }
  }
  return positions;
}

export function executeNovaCataclysm(
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
    const positions = getCirclePositions(cx, cy, phase.radius);
    for (const pos of positions) {
      const visual = world.createEntity();
      world.addComponent(visual, createPosition(pos.x, pos.y));
      world.addComponent(visual, createRenderable(
        phase.char,
        phase.color,
        "",
        RenderLayer.EFFECT_HIGH,
      ));
      world.addComponent(visual, createLifetime(phase.tick + 2));
    }
  }

  const maxRadius = Math.max(...ultData.phases.map((p) => p.radius));
  const aoe = world.createEntity();
  world.addComponent(aoe, createPosition(cx, cy));
  world.addComponent(aoe, createAreaEffect({
    shape: "circle",
    radius: maxRadius,
    damage: ultData.damage,
    ticks: 1,
    ownerId: casterEntity,
  }));

  const enemies = world.query("position", "health", "enemy");
  for (const eid of enemies) {
    const epos = world.getComponent<PositionComponent>(eid, "position")!;
    const dist = Math.abs(epos.x - cx) + Math.abs(epos.y - cy);
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
