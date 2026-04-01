import type { World, EntityId } from "../../core/ecs/types.js";
import type { AbilityData } from "../../core/data/schemas.js";
import type { Direction } from "../../utils/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import type { PositionComponent } from "../../components/position.js";
import { createPosition } from "../../components/position.js";
import { createVelocity } from "../../components/velocity.js";
import { createDirection } from "../../components/direction.js";
import { createRenderable, RenderLayer } from "../../components/renderable.js";
import { createProjectile } from "../../components/projectile.js";
import { createHitbox } from "../../components/hitbox.js";
import { createLifetime } from "../../components/lifetime.js";
import { directionToVec } from "../../utils/direction.js";

export function fireDelayed(
  world: World,
  casterEntity: EntityId,
  ability: AbilityData,
  direction: Direction,
  _events: EventBus,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return;

  const speed = (ability.pattern as { speed?: number }).speed ?? 1;
  const maxRange = (ability.pattern as { maxRange?: number }).maxRange ?? 8;
  const detonateAfterTicks = (ability.pattern as { detonateAfterTicks?: number }).detonateAfterTicks ?? 8;

  const dirVec = directionToVec(direction);
  const entity = world.createEntity();
  const char = ability.visuals.chars[direction];

  world.addComponent(entity, createPosition(casterPos.x, casterPos.y));
  world.addComponent(entity, createVelocity(dirVec.x * speed, dirVec.y * speed));
  world.addComponent(entity, createDirection(direction));
  world.addComponent(entity, createRenderable(char, ability.visuals.color, "", RenderLayer.PROJECTILE));
  world.addComponent(entity, createProjectile({
    ownerId: casterEntity,
    damage: ability.damage,
    abilityId: ability.id,
    maxRange,
    piercing: false,
  }));
  world.addComponent(entity, createHitbox(1, 1));
  world.addComponent(entity, createLifetime(detonateAfterTicks));
}
