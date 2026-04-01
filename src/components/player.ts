import type { Component } from "../core/ecs/types.js";

export interface PlayerComponent extends Component {
  readonly type: "player";
  invincibleTicks: number;
}

export function createPlayer(): PlayerComponent {
  return { type: "player", invincibleTicks: 0 };
}
