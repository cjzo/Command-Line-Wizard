import type { Component } from "../core/ecs/types.js";

export interface AbilitySlot {
  abilityId: string;
  cooldownRemaining: number;
  cooldownMax: number;
}

export interface UltimateSlot {
  ultimateId: string;
  ready: boolean;
}

export interface AbilitySetComponent extends Component {
  readonly type: "abilitySet";
  slot1: AbilitySlot;
  slot2: AbilitySlot;
  ultimate: UltimateSlot;
}

export function createAbilitySet(
  slot1Id: string,
  slot1Cooldown: number,
  slot2Id: string,
  slot2Cooldown: number,
  ultimateId: string,
): AbilitySetComponent {
  return {
    type: "abilitySet",
    slot1: { abilityId: slot1Id, cooldownRemaining: 0, cooldownMax: slot1Cooldown },
    slot2: { abilityId: slot2Id, cooldownRemaining: 0, cooldownMax: slot2Cooldown },
    ultimate: { ultimateId, ready: false },
  };
}
