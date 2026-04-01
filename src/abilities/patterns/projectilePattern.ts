import type { World, EntityId } from "../../core/ecs/types.js";
import type { AbilityData } from "../../core/data/schemas.js";
import type { Direction } from "../../utils/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import { createPosition } from "../../components/position.js";
import { createVelocity } from "../../components/velocity.js";
import { createDirection } from "../../components/direction.js";
import { createRenderable } from "../../components/renderable.js";
import { createProjectile } from "../../components/projectile.js";
import { createHitbox } from "../../components/hitbox.js";
import { createLifetime } from "../../components/lifetime.js";
import { RenderLayer } from "../../components/renderable.js";
import { directionToVec } from "../../utils/direction.js";
import type { PositionComponent } from "../../components/position.js";

export function fireProjectile(
  world: World,
  casterEntity: EntityId,
  ability: AbilityData,
  direction: Direction,
  _events: EventBus,
): void {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return;

  const speed = (ability.pattern as { speed?: number }).speed ?? 2;
  const maxRange = (ability.pattern as { maxRange?: number }).maxRange ?? 15;
  const piercing = (ability.pattern as { piercing?: boolean }).piercing ?? false;

  const dirVec = directionToVec(direction);
  const entity = world.createEntity();

  world.addComponent(entity, createPosition(casterPos.x, casterPos.y));
  world.addComponent(entity, createVelocity(dirVec.x * speed, dirVec.y * speed));
  world.addComponent(entity, createDirection(direction));

  const charMap = ability.visuals.chars;
  const char = charMap[direction];

  world.addComponent(entity, createRenderable(
    char,
    ability.visuals.color,
    "",
    RenderLayer.PROJECTILE,
  ));
  world.addComponent(entity, createProjectile({
    ownerId: casterEntity,
    damage: ability.damage,
    abilityId: ability.id,
    maxRange,
    piercing,
  }));
  world.addComponent(entity, createHitbox(1, 1));
  world.addComponent(entity, createLifetime(Math.ceil(maxRange / speed) + 2));
}
