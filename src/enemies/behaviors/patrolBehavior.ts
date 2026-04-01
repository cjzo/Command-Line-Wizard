import type { World, EntityId } from "../../core/ecs/types.js";
import type { PositionComponent } from "../../components/position.js";
import type { VelocityComponent } from "../../components/velocity.js";
import type { AIComponent } from "../../components/ai.js";
import type { DirectionComponent } from "../../components/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import { distance } from "../../utils/vector.js";
import { vecToDirection } from "../../utils/direction.js";
import type { EnemyData } from "../../core/data/schemas.js";
import { updateChase } from "./chaseBehavior.js";

function getEnemyStep(speed: number): number {
  return Math.max(0.5, speed * 0.7);
}

export function updatePatrol(
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

  const dist = distance(pos, playerPos);

  if (dist <= ai.aggroRange) {
    updateChase(world, entityId, playerPos, enemyData, events);
    return;
  }

  ai.state = "patrolling";
  const origin = (ai.stateData.origin as { x: number; y: number }) ?? { x: pos.x, y: pos.y };
  if (!ai.stateData.origin) {
    ai.stateData.origin = { x: pos.x, y: pos.y };
  }

  const patrolRadius = enemyData.ai.patrolRadius ?? 3;
  const patrolTick = ((ai.stateData.patrolTick as number) ?? 0) + 1;
  const step = getEnemyStep(enemyData.speed);
  ai.stateData.patrolTick = patrolTick;

  const phase = Math.floor(patrolTick / 4) % 4;
  const directions = [
    { dx: step, dy: 0 },
    { dx: 0, dy: step },
    { dx: -step, dy: 0 },
    { dx: 0, dy: -step },
  ];

  vel.dx = directions[phase].dx;
  vel.dy = directions[phase].dy;

  if (distance(pos, origin) > patrolRadius) {
    vel.dx = origin.x > pos.x ? step : -step;
    vel.dy = 0;
  }

  const newDir = vecToDirection({ x: vel.dx, y: vel.dy });
  if (newDir) dir.facing = newDir;
}
