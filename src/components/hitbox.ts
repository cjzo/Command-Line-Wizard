import type { Component } from "../core/ecs/types.js";

export interface HitboxComponent extends Component {
  readonly type: "hitbox";
  width: number;
  height: number;
}

export function createHitbox(width = 1, height = 1): HitboxComponent {
  return { type: "hitbox", width, height };
}
