import type { Component } from "../core/ecs/types.js";

export interface EnemyComponent extends Component {
  readonly type: "enemy";
  enemyId: string;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  currentAttackCooldown: number;
  chargeOnKill: number;
  damagedChar: string;
  hitFlashColor: string;
  hitFlashDuration: number;
  hitFlashRemaining: number;
}

export function createEnemy(config: {
  enemyId: string;
  damage: number;
  attackRange: number;
  attackCooldown: number;
  chargeOnKill: number;
  damagedChar: string;
  hitFlashColor: string;
  hitFlashDuration: number;
}): EnemyComponent {
  return {
    type: "enemy",
    ...config,
    currentAttackCooldown: 0,
    hitFlashRemaining: 0,
  };
}
