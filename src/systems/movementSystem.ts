import type { System, World } from "../core/ecs/types.js";
import type { PositionComponent } from "../components/position.js";
import type { VelocityComponent } from "../components/velocity.js";
import type { StatusEffectComponent } from "../components/statusEffect.js";
import { clamp } from "../utils/math.js";
import type { GameConfig } from "../config/defaults.js";

export class MovementSystem implements System {
  readonly name = "MovementSystem";

  constructor(private config: GameConfig) {}

  update(world: World): void {
    const entities = world.query("position", "velocity");

    for (const id of entities) {
      const pos = world.getComponent<PositionComponent>(id, "position")!;
      const vel = world.getComponent<VelocityComponent>(id, "velocity")!;

      let speedMult = 1;
      const statusFx = world.getComponent<StatusEffectComponent>(id, "statusEffect");
      if (statusFx) {
        for (const effect of statusFx.effects) {
          if (effect.effectType === "slow") {
            speedMult *= (1 - effect.magnitude);
          }
          if (effect.effectType === "stun") {
            speedMult = 0;
          }
        }
      }

      pos.x += vel.dx * speedMult;
      pos.y += vel.dy * speedMult;

      pos.x = clamp(pos.x, 0, this.config.grid.width - 1);
      pos.y = clamp(pos.y, 0, this.config.grid.height - 1);
    }
  }
}
