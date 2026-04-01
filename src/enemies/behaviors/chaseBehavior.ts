import type { World, EntityId } from "../../core/ecs/types.js";
import type { PositionComponent } from "../../components/position.js";
import type { VelocityComponent } from "../../components/velocity.js";
import type { AIComponent } from "../../components/ai.js";
import type { EnemyComponent } from "../../components/enemy.js";
import type { DirectionComponent } from "../../components/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import { distance } from "../../utils/vector.js";
import { vecToDirection } from "../../utils/direction.js";
import type { EnemyData } from "../../core/data/schemas.js";

function getEnemyStep(speed: number): number {
  return Math.max(0.5, speed * 0.7);
}

export function updateChase(
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
  const step = getEnemyStep(enemyData.speed);
  const meleeReach = enemy.attackRange + 0.35;

  if (dist > ai.aggroRange) {
    vel.dx = 0;
    vel.dy = 0;
    ai.state = "idle";
    return;
  }

  if (dist <= meleeReach) {
    vel.dx = 0;
    vel.dy = 0;
    ai.state = "attacking";

    if (enemy.currentAttackCooldown <= 0) {
      enemy.currentAttackCooldown = enemy.attackCooldown;

      const players = world.query("player", "position");
      if (players.length > 0) {
        events.emit({
          type: "damageDealt",
          source: entityId,
          target: players[0],
          amount: enemy.damage,
          abilityId: "melee",
        });
        events.emit({
          type: "combatLog",
          message: `${enemyData.name} attacks!`,
        });
      }
    }
    return;
  }

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

  const nextX = pos.x + vel.dx;
  const nextY = pos.y + vel.dy;
  if (Math.round(nextX) === Math.round(playerPos.x) && Math.round(nextY) === Math.round(playerPos.y)) {
    vel.dx = 0;
    vel.dy = 0;
  }

  const newDir = vecToDirection({ x: vel.dx, y: vel.dy });
  if (newDir) dir.facing = newDir;
}
