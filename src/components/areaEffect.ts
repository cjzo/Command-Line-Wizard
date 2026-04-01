import type { Component } from "../core/ecs/types.js";

export type AreaShape = "circle" | "cone" | "line" | "rect";

export interface AreaEffectComponent extends Component {
  readonly type: "areaEffect";
  shape: AreaShape;
  radius: number;
  damage: number;
  ticksRemaining: number;
  ownerId: number;
  hitEntities: Set<number>;
  damagePerTick: boolean;
  statusEffect?: {
    effectType: "slow" | "dot" | "stun";
    duration: number;
    magnitude: number;
  };
}

export function createAreaEffect(config: {
  shape: AreaShape;
  radius: number;
  damage: number;
  ticks: number;
  ownerId: number;
  damagePerTick?: boolean;
  statusEffect?: {
    effectType: "slow" | "dot" | "stun";
    duration: number;
    magnitude: number;
  };
}): AreaEffectComponent {
  return {
    type: "areaEffect",
    shape: config.shape,
    radius: config.radius,
    damage: config.damage,
    ticksRemaining: config.ticks,
    ownerId: config.ownerId,
    hitEntities: new Set(),
    damagePerTick: config.damagePerTick ?? false,
    statusEffect: config.statusEffect,
  };
}
