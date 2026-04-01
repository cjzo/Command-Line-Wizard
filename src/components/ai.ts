import type { Component } from "../core/ecs/types.js";

export type AIBehaviorId = "chase" | "ranged" | "patrol" | "blink" | "charger";
export type AIState = "idle" | "pursuing" | "attacking" | "retreating" | "patrolling" | "blinking" | "telegraphing" | "charging";

export interface AIComponent extends Component {
  readonly type: "ai";
  behaviorId: AIBehaviorId;
  state: AIState;
  aggroRange: number;
  stateData: Record<string, unknown>;
}

export function createAI(
  behaviorId: AIBehaviorId,
  aggroRange: number,
): AIComponent {
  return {
    type: "ai",
    behaviorId,
    state: "idle",
    aggroRange,
    stateData: {},
  };
}
