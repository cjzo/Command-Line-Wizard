export type GameState = "menu" | "abilitySelect" | "combat" | "death" | "victory";

export type GameTransition =
  | { from: "menu"; to: "abilitySelect" }
  | { from: "abilitySelect"; to: "combat" }
  | { from: "combat"; to: "death" }
  | { from: "combat"; to: "victory" }
  | { from: "death"; to: "menu" }
  | { from: "victory"; to: "menu" };

const VALID_TRANSITIONS: Record<GameState, GameState[]> = {
  menu: ["abilitySelect"],
  abilitySelect: ["combat"],
  combat: ["death", "victory"],
  death: ["menu"],
  victory: ["menu"],
};

export class GameFSM {
  private state: GameState;
  private listeners: ((state: GameState, prev: GameState) => void)[] = [];

  constructor(initialState: GameState = "menu") {
    this.state = initialState;
  }

  getState(): GameState {
    return this.state;
  }

  canTransition(to: GameState): boolean {
    return VALID_TRANSITIONS[this.state]?.includes(to) ?? false;
  }

  transition(to: GameState): boolean {
    if (!this.canTransition(to)) return false;

    const prev = this.state;
    this.state = to;

    for (const listener of this.listeners) {
      listener(this.state, prev);
    }
    return true;
  }

  onTransition(listener: (state: GameState, prev: GameState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  reset(): void {
    this.state = "menu";
  }
}
