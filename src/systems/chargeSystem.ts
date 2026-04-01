import type { System, World } from "../core/ecs/types.js";
import type { EventBus } from "../core/events/eventBus.js";
import type { DamageDealtEvent, EntityKilledEvent } from "../core/events/gameEvents.js";
import type { UltimateChargeComponent } from "../components/ultimateCharge.js";
import type { AbilitySetComponent } from "../components/abilitySet.js";
import type { EnemyComponent } from "../components/enemy.js";
import type { DataRegistry } from "../core/data/registry.js";

export class ChargeSystem implements System {
  readonly name = "ChargeSystem";
  private pendingChargeFromDamage: { playerId: number; abilityId: string; amount: number }[] = [];
  private pendingChargeFromKill: { playerId: number; chargeOnKill: number }[] = [];

  constructor(
    private events: EventBus,
    private registry: DataRegistry,
  ) {
    this.events.on("damageDealt", (event) => {
      const e = event as DamageDealtEvent;
      this.pendingChargeFromDamage.push({
        playerId: e.source,
        abilityId: e.abilityId,
        amount: e.amount,
      });
    });

    this.events.on("entityKilled", (event) => {
      const e = event as EntityKilledEvent;
      this.pendingChargeFromKill.push({
        playerId: e.killedBy,
        chargeOnKill: 0,
      });
    });
  }

  update(world: World): void {
    for (const pending of this.pendingChargeFromDamage) {
      if (!world.hasComponent(pending.playerId, "player")) continue;

      const charge = world.getComponent<UltimateChargeComponent>(pending.playerId, "ultimateCharge");
      if (!charge) continue;

      const abilityData = this.registry.getAbility(pending.abilityId);
      const chargeGain = abilityData?.chargeGain ?? 5;

      charge.current = Math.min(charge.max, charge.current + chargeGain);

      const abilitySet = world.getComponent<AbilitySetComponent>(pending.playerId, "abilitySet");
      if (abilitySet && charge.current >= charge.max && !abilitySet.ultimate.ready) {
        abilitySet.ultimate.ready = true;
        this.events.emit({ type: "ultimateReady", entity: pending.playerId });
        this.events.emit({ type: "combatLog", message: "ULTIMATE READY!" });
      }
    }
    this.pendingChargeFromDamage = [];

    for (const pending of this.pendingChargeFromKill) {
      if (!world.hasComponent(pending.playerId, "player")) continue;

      const charge = world.getComponent<UltimateChargeComponent>(pending.playerId, "ultimateCharge");
      if (!charge) continue;

      charge.current = Math.min(charge.max, charge.current + 10);

      const abilitySet = world.getComponent<AbilitySetComponent>(pending.playerId, "abilitySet");
      if (abilitySet && charge.current >= charge.max && !abilitySet.ultimate.ready) {
        abilitySet.ultimate.ready = true;
        this.events.emit({ type: "ultimateReady", entity: pending.playerId });
        this.events.emit({ type: "combatLog", message: "ULTIMATE READY!" });
      }
    }
    this.pendingChargeFromKill = [];
  }
}
