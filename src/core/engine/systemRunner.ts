import type { System, World } from "../ecs/types.js";
import { logger } from "../../utils/logger.js";

export class SystemRunner {
  private systems: System[] = [];

  register(system: System): void {
    this.systems.push(system);
    logger.debug(`System registered: ${system.name}`);
  }

  update(world: World, dt: number): void {
    for (const system of this.systems) {
      system.update(world, dt);
    }
  }

  getSystems(): readonly System[] {
    return this.systems;
  }

  clear(): void {
    this.systems = [];
  }
}
