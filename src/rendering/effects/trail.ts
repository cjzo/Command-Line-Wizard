import type { World } from "../../core/ecs/types.js";
import { createPosition } from "../../components/position.js";
import { createRenderable } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { RenderLayer } from "../../components/renderable.js";

export function spawnTrail(
  world: World,
  x: number,
  y: number,
  char: string,
  color: string,
  lifetime: number,
): void {
  const entity = world.createEntity();
  world.addComponent(entity, createPosition(x, y));
  world.addComponent(entity, createRenderable(char, color, "", RenderLayer.EFFECT_LOW));
  world.addComponent(entity, createLifetime(lifetime));
}
