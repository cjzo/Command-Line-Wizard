import type { World, EntityId } from "../../core/ecs/types.js";
import type { AbilityData } from "../../core/data/schemas.js";
import type { Direction } from "../../utils/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import { createPosition } from "../../components/position.js";
import { createRenderable } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { createAreaEffect } from "../../components/areaEffect.js";
import { RenderLayer } from "../../components/renderable.js";
import { directionToVec } from "../../utils/direction.js";
import { isNearHit } from "../../utils/combat.js";

function getConePositions(
  origin: { x: number; y: number },
  direction: Direction,
  range: number,
  width: number,
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const dir = directionToVec(direction);

  for (let i = 1; i <= range; i++) {
    const spreadAtDepth = Math.min(i, Math.floor(width / 2));
    const cx = origin.x + dir.x * i;
    const cy = origin.y + dir.y * i;

    positions.push({ x: cx, y: cy });

    for (let s = 1; s <= spreadAtDepth; s++) {
      if (dir.x === 0) {
        positions.push({ x: cx - s, y: cy });
        positions.push({ x: cx + s, y: cy });
      } else {
        positions.push({ x: cx, y: cy - s });
        positions.push({ x: cx, y: cy + s });
      }
    }
  }

  return positions;
}

export function fireCone(
  world: World,
  casterEntity: EntityId,
  ability: AbilityData,
  direction: Direction,
  events: EventBus,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return;

  const range = (ability.pattern as { range?: number }).range ?? 4;
  const width = (ability.pattern as { width?: number }).width ?? 3;

  const positions = getConePositions(casterPos, direction, range, width);
  const hitSet = new Set<EntityId>();

  for (const pos of positions) {
    const visual = world.createEntity();
    world.addComponent(visual, createPosition(pos.x, pos.y));
    world.addComponent(visual, createRenderable(
      ability.visuals.chars[direction],
      ability.visuals.color,
      "",
      RenderLayer.EFFECT_LOW,
    ));
    world.addComponent(visual, createLifetime(3));

    const enemies = world.query("position", "health", "enemy");
    for (const eid of enemies) {
      if (hitSet.has(eid)) continue;
      const epos = world.getComponent<PositionComponent>(eid, "position")!;
      if (isNearHit(epos.x, epos.y, pos.x, pos.y)) {
        hitSet.add(eid);
        events.emit({
          type: "damageDealt",
          source: casterEntity,
          target: eid,
          amount: ability.damage,
          abilityId: ability.id,
        });
      }
    }
  }
}
