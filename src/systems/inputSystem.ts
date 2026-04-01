import type { System, World } from "../core/ecs/types.js";
import type { InputBuffer } from "../core/engine/inputBuffer.js";
import type { VelocityComponent } from "../components/velocity.js";
import type { DirectionComponent } from "../components/direction.js";
import type { AbilitySetComponent } from "../components/abilitySet.js";
import { directionToVec, type Direction } from "../utils/direction.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { GameConfig } from "../config/defaults.js";

export class InputSystem implements System {
  readonly name = "InputSystem";

  constructor(
    private inputBuffer: InputBuffer,
    private events: EventBus,
    private config: GameConfig,
  ) {}

  update(world: World): void {
    const state = this.inputBuffer.consume();
    const players = world.query("player", "velocity", "direction");

    for (const id of players) {
      const vel = world.getComponent<VelocityComponent>(id, "velocity")!;
      const dir = world.getComponent<DirectionComponent>(id, "direction")!;
      const speed = this.config.player.speed;

      vel.dx = 0;
      vel.dy = 0;

      if (state.up) { vel.dy = -speed; dir.facing = "up"; }
      else if (state.down) { vel.dy = speed; dir.facing = "down"; }
      if (state.left) { vel.dx = -speed; dir.facing = "left"; }
      else if (state.right) { vel.dx = speed; dir.facing = "right"; }

      if (state.ability1) {
        this.events.emit({
          type: "abilityUsed",
          caster: id,
          abilityId: "slot1",
          direction: dir.facing,
        });
      }
      if (state.ability2) {
        this.events.emit({
          type: "abilityUsed",
          caster: id,
          abilityId: "slot2",
          direction: dir.facing,
        });
      }
      if (state.ultimate) {
        this.events.emit({
          type: "ultimateUsed",
          caster: id,
          ultimateId: "ultimate",
        });
      }
    }
  }
}
