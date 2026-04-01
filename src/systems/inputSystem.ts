import type { System, World } from "../core/ecs/types.js";
import type { InputBuffer } from "../core/engine/inputBuffer.js";
import type { VelocityComponent } from "../components/velocity.js";
import type { DirectionComponent } from "../components/direction.js";
import type { AbilitySetComponent } from "../components/abilitySet.js";
import { directionToVec, type Direction } from "../utils/direction.js";
import { getAimDirection } from "../utils/combat.js";
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

      if (state.up) vel.dy = -speed;
      else if (state.down) vel.dy = speed;
      if (state.left) vel.dx = -speed;
      else if (state.right) vel.dx = speed;

      const lastDir = this.inputBuffer.getLastMovementKey();
      if (lastDir && state[lastDir]) {
        dir.facing = lastDir as Direction;
      } else if (vel.dx !== 0 || vel.dy !== 0) {
        if (vel.dy < 0) dir.facing = "up";
        else if (vel.dy > 0) dir.facing = "down";
        else if (vel.dx < 0) dir.facing = "left";
        else if (vel.dx > 0) dir.facing = "right";
      }

      if (state.ability1) {
        const aimDir = getAimDirection(world, id, dir.facing);
        this.events.emit({
          type: "abilityUsed",
          caster: id,
          abilityId: "slot1",
          direction: aimDir,
        });
      }
      if (state.ability2) {
        const aimDir = getAimDirection(world, id, dir.facing);
        this.events.emit({
          type: "abilityUsed",
          caster: id,
          abilityId: "slot2",
          direction: aimDir,
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
