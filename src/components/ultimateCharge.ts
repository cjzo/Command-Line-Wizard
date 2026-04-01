import type { Component } from "../core/ecs/types.js";

export interface UltimateChargeComponent extends Component {
  readonly type: "ultimateCharge";
  current: number;
  max: number;
}

export function createUltimateCharge(max: number): UltimateChargeComponent {
  return { type: "ultimateCharge", current: 0, max };
}
