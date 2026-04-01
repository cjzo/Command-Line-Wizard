import type { World } from "../../core/ecs/types.js";
import { createPosition } from "../../components/position.js";
import { createVelocity } from "../../components/velocity.js";
import { createRenderable } from "../../components/renderable.js";
import { createLifetime } from "../../components/lifetime.js";
import { RenderLayer } from "../../components/renderable.js";
import type { Vec2 } from "../../utils/vector.js";
import { rng } from "../../utils/random.js";

export interface ParticleConfig {
  position: Vec2;
  count: number;
  chars: string[];
  colors: string[];
  speed: number;
  lifetime: number;
  spread?: number;
}

export function spawnParticles(world: World, config: ParticleConfig): void {
  const spread = config.spread ?? 1;

  for (let i = 0; i < config.count; i++) {
    const angle = (i / config.count) * Math.PI * 2;
    const dx = Math.cos(angle) * config.speed * (0.5 + rng().next() * spread);
    const dy = Math.sin(angle) * config.speed * (0.5 + rng().next() * spread);

    const char = config.chars[rng().nextInt(0, config.chars.length - 1)];
    const color = config.colors[rng().nextInt(0, config.colors.length - 1)];

    const entity = world.createEntity();
    world.addComponent(entity, createPosition(config.position.x, config.position.y));
    world.addComponent(entity, createVelocity(
      Math.round(dx),
      Math.round(dy * 0.5),
    ));
    world.addComponent(entity, createRenderable(
      char,
      color,
      "",
      RenderLayer.EFFECT_HIGH,
    ));
    world.addComponent(entity, createLifetime(
      config.lifetime + rng().nextInt(-1, 1),
    ));
  }
}

export function spawnExplosion(world: World, position: Vec2, radius: number): void {
  spawnParticles(world, {
    position,
    count: Math.max(4, radius * 4),
    chars: ["*", "+", "·", "."],
    colors: ["yellowBright", "red", "yellow"],
    speed: 1,
    lifetime: 3,
    spread: radius,
  });
}

export function spawnHitSpark(world: World, position: Vec2): void {
  spawnParticles(world, {
    position,
    count: 3,
    chars: ["*", "+"],
    colors: ["whiteBright", "yellow"],
    speed: 1,
    lifetime: 2,
  });
}

export function spawnDeathEffect(world: World, position: Vec2, color: string): void {
  spawnParticles(world, {
    position,
    count: 6,
    chars: ["*", ".", "·", "'"],
    colors: [color, "gray", "white"],
    speed: 1,
    lifetime: 3,
    spread: 1.5,
  });
}
