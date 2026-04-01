import type { World, EntityId } from "../../core/ecs/types.js";
import type { AbilityData } from "../../core/data/schemas.js";
import type { Direction } from "../../utils/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import { createPosition } from "../../components/position.js";
import { createRenderable, RenderLayer } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { directionToVec } from "../../utils/direction.js";
import { clamp } from "../../utils/math.js";
import { isNearHit } from "../../utils/combat.js";
import type { GameConfig } from "../../config/defaults.js";

export function executeDash(
  world: World,
  casterEntity: EntityId,
  ability: AbilityData,
  direction: Direction,
  events: EventBus,
  config: GameConfig,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return;

  const dashDistance = (ability.pattern as { dashDistance?: number }).dashDistance ?? 5;
  const dirVec = directionToVec(direction);
  const hitSet = new Set<EntityId>();

  for (let i = 1; i <= dashDistance; i++) {
    const tx = casterPos.x + dirVec.x * i;
    const ty = casterPos.y + dirVec.y * i;

    const cx = clamp(tx, 0, config.grid.width - 1);
    const cy = clamp(ty, 0, config.grid.height - 1);

    const trail = world.createEntity();
    world.addComponent(trail, createPosition(casterPos.x + dirVec.x * (i - 1), casterPos.y + dirVec.y * (i - 1)));
    world.addComponent(trail, createRenderable(
      ability.visuals.trailChar ?? "~",
      ability.visuals.trailColor ?? "gray",
      "",
      RenderLayer.EFFECT_LOW,
    ));
    world.addComponent(trail, createLifetime(ability.visuals.trailLifetime ?? 3));

    const enemies = world.query("position", "health", "enemy");
    for (const eid of enemies) {
      if (hitSet.has(eid)) continue;
      const epos = world.getComponent<PositionComponent>(eid, "position")!;
      if (isNearHit(epos.x, epos.y, cx, cy)) {
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

    if (cx !== tx || cy !== ty) break;
  }

  casterPos.x = clamp(casterPos.x + dirVec.x * dashDistance, 0, config.grid.width - 1);
  casterPos.y = clamp(casterPos.y + dirVec.y * dashDistance, 0, config.grid.height - 1);
}
