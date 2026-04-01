import type { System, World } from "../core/ecs/types.js";
import type { PositionComponent } from "../components/position.js";
import type { ProjectileComponent } from "../components/projectile.js";
import type { GameConfig } from "../config/defaults.js";

export class CleanupSystem implements System {
  readonly name = "CleanupSystem";

  constructor(private config: GameConfig) {}

  update(world: World): void {
    const projectiles = world.query("projectile", "position");

    for (const id of projectiles) {
      const pos = world.getComponent<PositionComponent>(id, "position")!;

      const outOfBounds =
        pos.x < -1 ||
        pos.x > this.config.grid.width ||
        pos.y < -1 ||
        pos.y > this.config.grid.height;

      if (outOfBounds) {
        world.destroyEntity(id);
      }
    }
  }
}
