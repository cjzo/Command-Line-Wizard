import type { Component } from "../core/ecs/types.js";

export interface PositionComponent extends Component {
  readonly type: "position";
  x: number;
  y: number;
}

export function createPosition(x: number, y: number): PositionComponent {
  return { type: "position", x, y };
}
