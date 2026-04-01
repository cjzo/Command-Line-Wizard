import type { Component } from "../core/ecs/types.js";

export interface RenderableComponent extends Component {
  readonly type: "renderable";
  char: string;
  fg: string;
  bg: string;
  layer: number;
  visible: boolean;
}

export const RenderLayer = {
  BACKGROUND: 0,
  EFFECT_LOW: 10,
  PROJECTILE: 20,
  EFFECT_HIGH: 30,
  ENEMY: 80,
  PLAYER: 100,
  UI: 120,
} as const;

export function createRenderable(
  char: string,
  fg: string,
  bg = "",
  layer: number = RenderLayer.ENEMY,
): RenderableComponent {
  return { type: "renderable", char, fg, bg, layer, visible: true };
}
