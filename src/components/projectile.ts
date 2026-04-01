import type { Component } from "../core/ecs/types.js";

export interface ProjectileComponent extends Component {
  readonly type: "projectile";
  ownerId: number;
  damage: number;
  abilityId: string;
  ticksAlive: number;
  maxRange: number;
  piercing: boolean;
  hitEntities: Set<number>;
}

export function createProjectile(config: {
  ownerId: number;
  damage: number;
  abilityId: string;
  maxRange: number;
  piercing?: boolean;
}): ProjectileComponent {
  return {
    type: "projectile",
    ...config,
    ticksAlive: 0,
    piercing: config.piercing ?? false,
    hitEntities: new Set(),
  };
}
