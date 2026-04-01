import type { System, World } from "../core/ecs/types.js";
import type { PositionComponent } from "../components/position.js";
import type { ProjectileComponent } from "../components/projectile.js";
import type { VelocityComponent } from "../components/velocity.js";
import type { EventBus } from "../core/events/eventBus.js";
import { isNearHit } from "../utils/combat.js";

function pathTouchesTarget(
  currentX: number,
  currentY: number,
  dx: number,
  dy: number,
  targetX: number,
  targetY: number,
): boolean {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
  const startX = currentX - dx;
  const startY = currentY - dy;

  for (let step = 1; step <= steps; step++) {
    const t = step / steps;
    const x = startX + dx * t;
    const y = startY + dy * t;
    if (isNearHit(targetX, targetY, x, y)) return true;
  }

  return false;
}

export class CollisionSystem implements System {
  readonly name = "CollisionSystem";

  constructor(private events: EventBus) {}

  update(world: World): void {
    const projectiles = world.query("projectile", "position", "velocity");
    const targets = world.query("position", "hitbox", "health");

    for (const projId of projectiles) {
      const proj = world.getComponent<ProjectileComponent>(projId, "projectile")!;
      const projPos = world.getComponent<PositionComponent>(projId, "position")!;
      const projVel = world.getComponent<VelocityComponent>(projId, "velocity")!;

      proj.ticksAlive++;

      for (const targetId of targets) {
        if (targetId === proj.ownerId) continue;
        if (proj.hitEntities.has(targetId)) continue;

        const isPlayerProjectile = world.hasComponent(proj.ownerId, "player");
        const isTargetEnemy = world.hasComponent(targetId, "enemy");
        const isTargetPlayer = world.hasComponent(targetId, "player");
        const isEnemyProjectile = world.hasComponent(proj.ownerId, "enemy");

        if (isPlayerProjectile && !isTargetEnemy) continue;
        if (isEnemyProjectile && !isTargetPlayer) continue;

        const targetPos = world.getComponent<PositionComponent>(targetId, "position")!;

        if (pathTouchesTarget(
          projPos.x,
          projPos.y,
          projVel.dx,
          projVel.dy,
          targetPos.x,
          targetPos.y,
        )) {
          proj.hitEntities.add(targetId);

          this.events.emit({
            type: "damageDealt",
            source: proj.ownerId,
            target: targetId,
            amount: proj.damage,
            abilityId: proj.abilityId,
          });

          if (!proj.piercing) {
            world.destroyEntity(projId);
            break;
          }
        }
      }
    }
  }
}
