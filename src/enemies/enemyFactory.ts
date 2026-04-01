import type { World, EntityId } from "../core/ecs/types.js";
import type { EnemyData } from "../core/data/schemas.js";
import { createPosition } from "../components/position.js";
import { createVelocity } from "../components/velocity.js";
import { createDirection } from "../components/direction.js";
import { createHealth } from "../components/health.js";
import { createRenderable, RenderLayer } from "../components/renderable.js";
import { createEnemy } from "../components/enemy.js";
import { createAI } from "../components/ai.js";
import { createHitbox } from "../components/hitbox.js";
import { createStatusEffect } from "../components/statusEffect.js";

export function spawnEnemy(
  world: World,
  enemyData: EnemyData,
  x: number,
  y: number,
): EntityId {
  const entity = world.createEntity();

  world.addComponent(entity, createPosition(x, y));
  world.addComponent(entity, createVelocity(0, 0));
  world.addComponent(entity, createDirection("left"));
  world.addComponent(entity, createHealth(enemyData.hp));
  world.addComponent(entity, createRenderable(
    enemyData.visuals.char,
    enemyData.visuals.color,
    "",
    RenderLayer.ENEMY,
  ));
  world.addComponent(entity, createEnemy({
    enemyId: enemyData.id,
    damage: enemyData.damage,
    attackRange: enemyData.attackRange,
    attackCooldown: enemyData.attackCooldown,
    chargeOnKill: enemyData.chargeOnKill,
    damagedChar: enemyData.visuals.damagedChar,
    hitFlashColor: enemyData.visuals.hitFlashColor,
    hitFlashDuration: enemyData.visuals.hitFlashDuration,
  }));
  world.addComponent(entity, createAI(
    enemyData.ai.behavior,
    enemyData.ai.aggroRange,
  ));
  world.addComponent(entity, createHitbox(1, 1));
  world.addComponent(entity, createStatusEffect());

  return entity;
}
