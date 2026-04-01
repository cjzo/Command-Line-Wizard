import type { Direction } from "../../utils/direction.js";

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  ability1: boolean;
  ability2: boolean;
  ultimate: boolean;
  dash: boolean;
  quit: boolean;
  confirm: boolean;
}

type MovementKey = "up" | "down" | "left" | "right";

const MOVEMENT_KEYS: readonly MovementKey[] = ["up", "down", "left", "right"];

export function createInputState(): InputState {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    ability1: false,
    ability2: false,
    ultimate: false,
    dash: false,
    quit: false,
    confirm: false,
  };
}

export class InputBuffer {
  private transient: InputState = createInputState();
  private consumed: InputState = createInputState();
  private movementExpiresAt: Record<MovementKey, number> = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  };
  private lastMovementKey: MovementKey | null = null;

  constructor(private movementLeaseMs = 180) {}

  private isMovementKey(key: keyof InputState): key is MovementKey {
    return MOVEMENT_KEYS.includes(key as MovementKey);
  }

  private getMovementState(now: number): Pick<
    InputState,
    "up" | "down" | "left" | "right"
  > {
    return {
      up: this.movementExpiresAt.up > now,
      down: this.movementExpiresAt.down > now,
      left: this.movementExpiresAt.left > now,
      right: this.movementExpiresAt.right > now,
    };
  }

  press(key: keyof InputState): void {
    if (this.isMovementKey(key)) {
      this.movementExpiresAt[key] = Date.now() + this.movementLeaseMs;
      this.lastMovementKey = key;
      return;
    }

    this.transient[key] = true;
  }

  release(key: keyof InputState): void {
    if (this.isMovementKey(key)) {
      this.movementExpiresAt[key] = 0;
      return;
    }

    this.transient[key] = false;
  }

  /**
   * Returns a snapshot of current input.
   * Action keys are one-shot impulses, while movement keys use
   * a short lease so held terminal repeat events feel continuous.
   */
  consume(): InputState {
    const now = Date.now();
    this.consumed = {
      ...this.transient,
      ...this.getMovementState(now),
    };
    this.transient = createInputState();
    return this.consumed;
  }

  getMovementDirection(): Direction | null {
    const state = this.getMovementState(Date.now());
    if (state.up) return "up";
    if (state.down) return "down";
    if (state.left) return "left";
    if (state.right) return "right";
    return null;
  }

  getLastMovementKey(): MovementKey | null {
    return this.lastMovementKey;
  }

  reset(): void {
    this.transient = createInputState();
    this.consumed = createInputState();
    this.movementExpiresAt = {
      up: 0,
      down: 0,
      left: 0,
      right: 0,
    };
    this.lastMovementKey = null;
  }
}
