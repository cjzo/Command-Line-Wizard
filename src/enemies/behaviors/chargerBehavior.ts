import type { World, EntityId } from "../../core/ecs/types.js";
import type { PositionComponent } from "../../components/position.js";
import type { VelocityComponent } from "../../components/velocity.js";
import type { AIComponent } from "../../components/ai.js";
import type { EnemyComponent } from "../../components/enemy.js";
import type { DirectionComponent } from "../../components/direction.js";
import type { RenderableComponent } from "../../components/renderable.js";
import type { EventBus } from "../../core/events/eventBus.js";
import { distance } from "../../utils/vector.js";
import { vecToDirection } from "../../utils/direction.js";
import type { EnemyData } from "../../core/data/schemas.js";

const TELEGRAPH_TICKS = 2;
const CHARGE_SPEED_MULTIPLIER = 3;
const CHARGE_COOLDOWN = 6;

function isAxisAligned(a: PositionComponent, b: PositionComponent): "horizontal" | "vertical" | null {
  const ax = Math.round(a.x);
  const ay = Math.round(a.y);
  const bx = Math.round(b.x);
  const by = Math.round(b.y);

  if (ay === by) return "horizontal";
  if (ax === bx) return "vertical";
  return null;
}

export function updateCharger(
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
  const renderable = world.getComponent<RenderableComponent>(entityId, "renderable");

  const dist = distance(pos, playerPos);

  if (dist > ai.aggroRange) {
    vel.dx = 0;
    vel.dy = 0;
    ai.state = "idle";
    return;
  }

  const chargeCd = (ai.stateData.chargeCooldown as number) ?? 0;
  if (chargeCd > 0) {
    ai.stateData.chargeCooldown = chargeCd - 1;
  }

  const chargeRange = enemyData.ai.chargeRange ?? 10;

  if (ai.state === "telegraphing") {
    vel.dx = 0;
    vel.dy = 0;

    const telegraphTick = ((ai.stateData.telegraphTick as number) ?? 0) + 1;
    ai.stateData.telegraphTick = telegraphTick;

    if (renderable) {
      renderable.char = telegraphTick % 2 === 0
        ? enemyData.visuals.char
        : enemyData.visuals.damagedChar;
    }

    if (telegraphTick >= TELEGRAPH_TICKS) {
      ai.state = "charging";
      ai.stateData.telegraphTick = 0;
      ai.stateData.chargeTargetX = Math.round(playerPos.x);
      ai.stateData.chargeTargetY = Math.round(playerPos.y);

      if (renderable) {
        renderable.char = enemyData.visuals.damagedChar;
      }
    }
    return;
  }

  if (ai.state === "charging") {
    const targetX = ai.stateData.chargeTargetX as number;
    const targetY = ai.stateData.chargeTargetY as number;
    const chargeSpeed = enemyData.speed * CHARGE_SPEED_MULTIPLIER;

    const dx = targetX - Math.round(pos.x);
    const dy = targetY - Math.round(pos.y);

    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
      vel.dx = 0;
      vel.dy = 0;
      ai.state = "pursuing";
      ai.stateData.chargeCooldown = CHARGE_COOLDOWN;

      if (renderable) {
        renderable.char = enemyData.visuals.char;
      }

      if (enemy.currentAttackCooldown <= 0) {
        const players = world.query("player", "position");
        if (players.length > 0) {
          const ppos = world.getComponent<PositionComponent>(players[0], "position")!;
          if (distance(pos, ppos) <= 2) {
            enemy.currentAttackCooldown = enemy.attackCooldown;
            events.emit({
              type: "damageDealt",
              source: entityId,
              target: players[0],
              amount: enemy.damage,
              abilityId: "charge",
            });
            events.emit({
              type: "combatLog",
              message: `${enemyData.name} slams into you!`,
            });
            events.emit({
              type: "screenShake",
              intensity: 2,
              duration: 2,
            });
          }
        }
      }
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      vel.dx = dx > 0 ? chargeSpeed : -chargeSpeed;
      vel.dy = 0;
    } else {
      vel.dx = 0;
      vel.dy = dy > 0 ? chargeSpeed : -chargeSpeed;
    }

    const newDir = vecToDirection({ x: vel.dx, y: vel.dy });
    if (newDir) dir.facing = newDir;
    return;
  }

  const axis = isAxisAligned(pos, playerPos);
  if (axis && dist <= chargeRange && chargeCd <= 0) {
    ai.state = "telegraphing";
    ai.stateData.telegraphTick = 0;
    vel.dx = 0;
    vel.dy = 0;

    events.emit({
      type: "combatLog",
      message: `${enemyData.name} prepares to charge!`,
    });
    return;
  }

  ai.state = "pursuing";
  const dx = playerPos.x - pos.x;
  const dy = playerPos.y - pos.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    vel.dx = dx > 0 ? enemyData.speed : -enemyData.speed;
    vel.dy = 0;
  } else {
    vel.dx = 0;
    vel.dy = dy > 0 ? enemyData.speed : -enemyData.speed;
  }

  const newDir = vecToDirection({ x: vel.dx, y: vel.dy });
  if (newDir) dir.facing = newDir;
}
