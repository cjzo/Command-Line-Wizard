import type { World, EntityId } from "../core/ecs/types.js";
import type { PositionComponent } from "../components/position.js";
import { ALL_DIRECTIONS, directionToVec, type Direction } from "./direction.js";

const AIM_CORRIDOR_WIDTH = 2;
const AIM_MAX_RANGE = 15;

/**
 * Proximity-based hit check. Returns true if (entityX, entityY) is close
 * enough to (cellX, cellY) to count as a hit. Uses squared Euclidean
 * distance to avoid sqrt overhead.
 */
export function isNearHit(
  entityX: number,
  entityY: number,
  cellX: number,
  cellY: number,
  tolerance = 1.2,
): boolean {
  const dx = entityX - cellX;
  const dy = entityY - cellY;
  return dx * dx + dy * dy <= tolerance * tolerance;
}

/**
 * Find the best cardinal direction to fire an ability.
 * Prefers the player's current facing if a target is in that corridor.
 * Otherwise snaps to the direction with the nearest reachable enemy.
 */
export function getAimDirection(
  world: World,
  casterEntity: EntityId,
  facing: Direction,
): Direction {
  const casterPos = world.getComponent<PositionComponent>(casterEntity, "position");
  if (!casterPos) return facing;

  const enemies = world.query("position", "health", "enemy");
  if (enemies.length === 0) return facing;

  let bestDir = facing;
  let bestDist = Infinity;
  let facingHasTarget = false;

  for (const dir of ALL_DIRECTIONS) {
    const vec = directionToVec(dir);
    let nearestInDir = Infinity;

    for (const eid of enemies) {
      const epos = world.getComponent<PositionComponent>(eid, "position")!;
      const dx = epos.x - casterPos.x;
      const dy = epos.y - casterPos.y;

      const forward = dx * vec.x + dy * vec.y;
      if (forward <= 0 || forward > AIM_MAX_RANGE) continue;

      const perpendicular = Math.abs(dx * vec.y - dy * vec.x);
      if (perpendicular > AIM_CORRIDOR_WIDTH) continue;

      if (forward < nearestInDir) {
        nearestInDir = forward;
      }
    }

    if (nearestInDir < Infinity) {
      if (dir === facing) {
        facingHasTarget = true;
        if (nearestInDir < bestDist) {
          bestDist = nearestInDir;
          bestDir = dir;
        }
      } else if (nearestInDir < bestDist) {
        bestDist = nearestInDir;
        bestDir = dir;
      }
    }
  }

  if (facingHasTarget) return facing;
  return bestDir;
}
