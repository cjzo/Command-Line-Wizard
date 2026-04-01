import type { Component } from "../core/ecs/types.js";

export interface LifetimeComponent extends Component {
  readonly type: "lifetime";
  ticksRemaining: number;
}

export function createLifetime(ticks: number): LifetimeComponent {
  return { type: "lifetime", ticksRemaining: ticks };
}
