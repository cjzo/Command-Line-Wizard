import type { System, World } from "../core/ecs/types.js";
import type { LifetimeComponent } from "../components/lifetime.js";

export class LifetimeSystem implements System {
  readonly name = "LifetimeSystem";

  update(world: World): void {
    const entities = world.query("lifetime");

    for (const id of entities) {
      const lifetime = world.getComponent<LifetimeComponent>(id, "lifetime")!;
      lifetime.ticksRemaining--;

      if (lifetime.ticksRemaining <= 0) {
        world.destroyEntity(id);
      }
    }
  }
}
