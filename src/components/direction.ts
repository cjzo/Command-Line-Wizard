import type { Component } from "../core/ecs/types.js";
import type { Direction } from "../utils/direction.js";

export interface DirectionComponent extends Component {
  readonly type: "direction";
  facing: Direction;
}

export function createDirection(facing: Direction): DirectionComponent {
  return { type: "direction", facing };
}
