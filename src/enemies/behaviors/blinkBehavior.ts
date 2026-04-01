import type { World, EntityId } from "../../core/ecs/types.js";
import type { PositionComponent } from "../../components/position.js";
import type { VelocityComponent } from "../../components/velocity.js";
import type { AIComponent } from "../../components/ai.js";
import type { EnemyComponent } from "../../components/enemy.js";
import type { DirectionComponent } from "../../components/direction.js";
import type { EventBus } from "../../core/events/eventBus.js";
import { distance } from "../../utils/vector.js";
import { vecToDirection } from "../../utils/direction.js";
import { rng } from "../../utils/random.js";
import type { EnemyData } from "../../core/data/schemas.js";

const BLINK_COOLDOWN = 8;
const BLINK_APPROACH_MIN = 2;
const BLINK_APPROACH_MAX = 3;
const BLINK_RETREAT_MIN = 4;
const BLINK_RETREAT_MAX = 6;

function blinkToNearPlayer(
  pos: PositionComponent,
  playerPos: PositionComponent,
  minDist: number,
  maxDist: number,
): { x: number; y: number } {
  const angle = rng().next() * Math.PI * 2;
  const dist = rng().nextInt(minDist, maxDist);
  return {
    x: Math.round(playerPos.x + Math.cos(angle) * dist),
    y: Math.round(playerPos.y + Math.sin(angle) * dist),
  };
}

export function updateBlink(
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

  vel.dx = 0;
  vel.dy = 0;

  const dist = distance(pos, playerPos);
  if (dist > ai.aggroRange) {
    ai.state = "idle";
    return;
  }

  const blinkCd = ((ai.stateData.blinkCooldown as number) ?? 0);

  if (blinkCd > 0) {
    ai.stateData.blinkCooldown = blinkCd - 1;
    ai.state = "idle";
    return;
  }

  const hasAttacked = (ai.stateData.hasAttacked as boolean) ?? false;

  if (!hasAttacked) {
    const dest = blinkToNearPlayer(pos, playerPos, BLINK_APPROACH_MIN, BLINK_APPROACH_MAX);
    pos.x = dest.x;
    pos.y = dest.y;
    ai.state = "blinking";

    const lookDir = vecToDirection({ x: playerPos.x - pos.x, y: playerPos.y - pos.y });
    if (lookDir) dir.facing = lookDir;

    if (distance(pos, playerPos) <= enemy.attackRange && enemy.currentAttackCooldown <= 0) {
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
          message: `${enemyData.name} strikes from the shadows!`,
        });
      }
    }

    ai.stateData.hasAttacked = true;
  } else {
    const dest = blinkToNearPlayer(pos, playerPos, BLINK_RETREAT_MIN, BLINK_RETREAT_MAX);
    pos.x = dest.x;
    pos.y = dest.y;
    ai.state = "blinking";

    ai.stateData.hasAttacked = false;
    ai.stateData.blinkCooldown = BLINK_COOLDOWN;
  }
}
