import type { Component } from "../core/ecs/types.js";

export type StatusEffectType = "slow" | "dot" | "stun";

export interface StatusEffectInstance {
  effectType: StatusEffectType;
  duration: number;
  magnitude: number;
  sourceId: number;
}

export interface StatusEffectComponent extends Component {
  readonly type: "statusEffect";
  effects: StatusEffectInstance[];
}

export function createStatusEffect(): StatusEffectComponent {
  return { type: "statusEffect", effects: [] };
}

export function addStatusEffect(
  comp: StatusEffectComponent,
  effect: StatusEffectInstance,
): void {
  const existing = comp.effects.find(
    (e) => e.effectType === effect.effectType && e.sourceId === effect.sourceId,
  );
  if (existing) {
    existing.duration = Math.max(existing.duration, effect.duration);
    existing.magnitude = Math.max(existing.magnitude, effect.magnitude);
  } else {
    comp.effects.push(effect);
  }
}
