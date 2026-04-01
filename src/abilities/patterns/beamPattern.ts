import type { World, EntityId } from "../../core/ecs/types.js";
import type { AbilityData } from "../../core/data/schemas.js";
import type { Direction } from "../../utils/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import type { HealthComponent } from "../../components/health.js";
import { createPosition } from "../../components/position.js";
import { createRenderable } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { RenderLayer } from "../../components/renderable.js";
import { directionToVec } from "../../utils/direction.js";
import { distance } from "../../utils/vector.js";

export function fireBeam(
  world: World,
  casterEntity: EntityId,
  ability: AbilityData,
  direction: Direction,
  events: EventBus,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return;

  const range = (ability.pattern as { range?: number }).range ?? 20;
  const chainCount = (ability.pattern as { chainCount?: number }).chainCount ?? 0;
  const chainRange = (ability.pattern as { chainRange?: number }).chainRange ?? 3;

  const dirVec = directionToVec(direction);
  const charMap = ability.visuals.chars;
  const beamChar = charMap[direction];

  const hitEntities: EntityId[] = [];

  for (let i = 1; i <= range; i++) {
    const bx = casterPos.x + dirVec.x * i;
    const by = casterPos.y + dirVec.y * i;

    const visual = world.createEntity();
    world.addComponent(visual, createPosition(bx, by));
    world.addComponent(visual, createRenderable(beamChar, ability.visuals.color, "", RenderLayer.PROJECTILE));
    world.addComponent(visual, createLifetime(2));

    const enemies = world.query("position", "health", "enemy");
    for (const eid of enemies) {
      if (hitEntities.includes(eid)) continue;
      const epos = world.getComponent<PositionComponent>(eid, "position")!;
      if (Math.round(epos.x) === Math.round(bx) && Math.round(epos.y) === Math.round(by)) {
        hitEntities.push(eid);
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

  for (let c = 0; c < chainCount && hitEntities.length > 0; c++) {
    const lastHit = hitEntities[hitEntities.length - 1];
    const lastPos = world.getComponent<PositionComponent>(lastHit, "position");
    if (!lastPos) break;

    const enemies = world.query("position", "health", "enemy");
    let closest: EntityId | null = null;
    let closestDist = Infinity;

    for (const eid of enemies) {
      if (hitEntities.includes(eid)) continue;
      const epos = world.getComponent<PositionComponent>(eid, "position")!;
      const d = distance(lastPos, epos);
      if (d <= chainRange && d < closestDist) {
        closestDist = d;
        closest = eid;
      }
    }

    if (closest !== null) {
      hitEntities.push(closest);
      const cpos = world.getComponent<PositionComponent>(closest, "position")!;

      const chainVisual = world.createEntity();
      world.addComponent(chainVisual, createPosition(cpos.x, cpos.y));
      world.addComponent(chainVisual, createRenderable("┼", "yellowBright", "", RenderLayer.EFFECT_HIGH));
      world.addComponent(chainVisual, createLifetime(2));

      events.emit({
        type: "damageDealt",
        source: casterEntity,
        target: closest,
        amount: Math.floor(ability.damage * 0.7),
        abilityId: ability.id,
      });
    }
  }
}
