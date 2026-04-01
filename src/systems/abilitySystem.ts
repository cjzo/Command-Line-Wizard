import type { System, World } from "../core/ecs/types.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { AbilityUsedEvent } from "../core/events/gameEvents.js";
import type { AbilitySetComponent } from "../components/abilitySet.js";
import type { DirectionComponent } from "../components/direction.js";
import type { UltimateChargeComponent } from "../components/ultimateCharge.js";
import { executeAbility } from "../abilities/abilityFactory.js";
import { executeUltimate } from "../abilities/ultimates/ultimateFactory.js";
import type { DataRegistry } from "../core/data/registry.js";
import type { GameConfig } from "../config/defaults.js";

export class AbilitySystem implements System {
  readonly name = "AbilitySystem";
  private pendingAbilities: AbilityUsedEvent[] = [];
  private pendingUltimates: { caster: number; ultimateId: string }[] = [];

  constructor(
    private events: EventBus,
    private registry: DataRegistry,
    private config: GameConfig,
  ) {
    this.events.on("abilityUsed", (event) => {
      this.pendingAbilities.push(event as AbilityUsedEvent);
    });
    this.events.on("ultimateUsed", (event) => {
      const e = event as { caster: number; ultimateId: string };
      this.pendingUltimates.push(e);
    });
  }

  update(world: World): void {
    for (const event of this.pendingAbilities) {
      const abilitySet = world.getComponent<AbilitySetComponent>(event.caster, "abilitySet");
      if (!abilitySet) continue;

      let slot;
      if (event.abilityId === "slot1") slot = abilitySet.slot1;
      else if (event.abilityId === "slot2") slot = abilitySet.slot2;
      else continue;

      if (slot.cooldownRemaining > 0) continue;

      const abilityData = this.registry.getAbility(slot.abilityId);
      if (!abilityData) continue;

      const dir = world.getComponent<DirectionComponent>(event.caster, "direction");
      if (!dir) continue;

      const fireDirection = abilityData.type === "movement"
        ? dir.facing
        : event.direction;

      const success = executeAbility(
        world,
        event.caster,
        abilityData,
        fireDirection,
        this.events,
        this.config,
      );

      if (success) {
        slot.cooldownRemaining = slot.cooldownMax;
        this.events.emit({
          type: "combatLog",
          message: `Used ${abilityData.name}`,
        });
      }
    }
    this.pendingAbilities = [];

    for (const event of this.pendingUltimates) {
      const abilitySet = world.getComponent<AbilitySetComponent>(event.caster, "abilitySet");
      const charge = world.getComponent<UltimateChargeComponent>(event.caster, "ultimateCharge");
      if (!abilitySet || !charge) continue;
      if (!abilitySet.ultimate.ready) continue;

      const ultData = this.registry.getUltimate(abilitySet.ultimate.ultimateId);
      if (!ultData) continue;
      if (charge.current < ultData.chargeRequired) continue;

      charge.current = 0;
      abilitySet.ultimate.ready = false;

      this.events.emit({
        type: "combatLog",
        message: `ULTIMATE: ${ultData.name}!`,
      });

      executeUltimate(world, event.caster, ultData, this.events);

      if (ultData.screenShake) {
        this.events.emit({
          type: "screenShake",
          intensity: ultData.screenShake.intensity,
          duration: ultData.screenShake.duration,
        });
      }
      if (ultData.hitstop) {
        this.events.emit({
          type: "hitstop",
          duration: ultData.hitstop.duration,
        });
      }
    }
    this.pendingUltimates = [];
  }
}
