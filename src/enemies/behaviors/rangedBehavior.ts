import type { World, EntityId } from "../../core/ecs/types.js";
import type { PositionComponent } from "../../components/position.js";
import type { VelocityComponent } from "../../components/velocity.js";
import type { AIComponent } from "../../components/ai.js";
import type { EnemyComponent } from "../../components/enemy.js";
import type { DirectionComponent } from "../../components/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import { createPosition } from "../../components/position.js";
import { createVelocity } from "../../components/velocity.js";
import { createDirection } from "../../components/direction.js";
import { createRenderable, RenderLayer } from "../../components/renderable.js";
import { createProjectile } from "../../components/projectile.js";
import { createHitbox } from "../../components/hitbox.js";
import { createLifetime } from "../../components/lifetime.js";
import { distance } from "../../utils/vector.js";
import { vecToDirection, directionToVec } from "../../utils/direction.js";
import type { EnemyData } from "../../core/data/schemas.js";

function getEnemyStep(speed: number): number {
  return Math.max(0.5, speed * 0.7);
}

export function updateRanged(
  world: World,
  entityId: EntityId,
  playerPos: PositionComponent,
  enemyData: EnemyData,
  events: EventBus,
): void {
  const pos = world.getComponent<PositionComponent>(entityId, "position")!;
  const vel = world.getComponent<VelocityComponent>(entityId, "velocity")!;
  const ai = world.getComponent<AIComponent>(entityId, "ai")!;
  const dir = world.getComponent<DirectionComponent>(entityId, "direction")!;
  const enemy = world.getComponent<EnemyComponent>(entityId, "enemy")!;

  const dist = distance(pos, playerPos);
  const preferredRange = enemyData.ai.preferredRange ?? 6;
  const step = getEnemyStep(enemyData.speed);

  if (dist > ai.aggroRange) {
    vel.dx = 0;
    vel.dy = 0;
    ai.state = "idle";
    return;
  }

  if (dist < preferredRange - 1) {
    ai.state = "retreating";
    const dx = pos.x - playerPos.x;
    const dy = pos.y - playerPos.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      vel.dx = dx > 0 ? step : -step;
      vel.dy = 0;
    } else {
      vel.dx = 0;
      vel.dy = dy > 0 ? step : -step;
    }
  } else if (dist > preferredRange + 1) {
    ai.state = "pursuing";
    const dx = playerPos.x - pos.x;
    const dy = playerPos.y - pos.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      vel.dx = dx > 0 ? step : -step;
      vel.dy = 0;
    } else {
      vel.dx = 0;
      vel.dy = dy > 0 ? step : -step;
    }
  } else {
    vel.dx = 0;
    vel.dy = 0;
    ai.state = "attacking";
  }

  const lookDir = vecToDirection({
    x: playerPos.x - pos.x,
    y: playerPos.y - pos.y,
  });
  if (lookDir) dir.facing = lookDir;

  if (enemy.currentAttackCooldown <= 0 && dist <= enemy.attackRange) {
    enemy.currentAttackCooldown = enemy.attackCooldown;

    const dirVec = directionToVec(dir.facing);
    const proj = world.createEntity();
    world.addComponent(proj, createPosition(pos.x, pos.y));
    world.addComponent(proj, createVelocity(dirVec.x * 2, dirVec.y * 2));
    world.addComponent(proj, createDirection(dir.facing));
    world.addComponent(proj, createRenderable("•", "magentaBright", "", RenderLayer.PROJECTILE));
    world.addComponent(proj, createProjectile({
      ownerId: entityId,
      damage: enemy.damage,
      abilityId: "enemyBolt",
      maxRange: 12,
    }));
    world.addComponent(proj, createHitbox(1, 1));
    world.addComponent(proj, createLifetime(8));

    events.emit({
      type: "combatLog",
      message: `${enemyData.name} fires!`,
    });
  }
}
