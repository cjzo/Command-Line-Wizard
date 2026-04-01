import type { Component } from "../core/ecs/types.js";

export interface HealthComponent extends Component {
  readonly type: "health";
  current: number;
  max: number;
}

export function createHealth(max: number): HealthComponent {
  return { type: "health", current: max, max };
}
