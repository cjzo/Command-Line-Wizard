import type { Component } from "../core/ecs/types.js";

export interface VelocityComponent extends Component {
  readonly type: "velocity";
  dx: number;
  dy: number;
}

export function createVelocity(dx: number, dy: number): VelocityComponent {
  return { type: "velocity", dx, dy };
}
