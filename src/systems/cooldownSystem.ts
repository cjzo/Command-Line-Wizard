import type { System, World } from "../core/ecs/types.js";
import type { AbilitySetComponent } from "../components/abilitySet.js";

export class CooldownSystem implements System {
  readonly name = "CooldownSystem";

  update(world: World): void {
    const entities = world.query("abilitySet");

    for (const id of entities) {
      const abilitySet = world.getComponent<AbilitySetComponent>(id, "abilitySet")!;

      if (abilitySet.slot1.cooldownRemaining > 0) {
        abilitySet.slot1.cooldownRemaining--;
      }
      if (abilitySet.slot2.cooldownRemaining > 0) {
        abilitySet.slot2.cooldownRemaining--;
      }
    }
  }
}
