import type { World } from "../ecs/types.js";
import type { EventBus } from "../events/eventBus.js";
import type { SystemRunner } from "./systemRunner.js";
import { GameWorld } from "../ecs/world.js";
import { logger } from "../../utils/logger.js";

export interface GameLoopCallbacks {
  onTick: (tick: number) => void;
  onRender: () => void;
}

export class GameLoop {
  private running = false;
  private tick = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private hitstopRemaining = 0;

  constructor(
    private world: GameWorld,
    private systems: SystemRunner,
    private events: EventBus,
    private tickMs: number,
    private callbacks: GameLoopCallbacks,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.tick = 0;
    logger.info("Game loop started", { tickMs: this.tickMs });
    this.scheduleNext();
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    logger.info("Game loop stopped");
  }

  isRunning(): boolean {
    return this.running;
  }

  getTick(): number {
    return this.tick;
  }

  applyHitstop(ticks: number): void {
    this.hitstopRemaining = Math.max(this.hitstopRemaining, ticks);
  }

  private scheduleNext(): void {
    if (!this.running) return;
    this.timer = setTimeout(() => this.step(), this.tickMs);
  }

  private step(): void {
    if (!this.running) return;

    if (this.hitstopRemaining > 0) {
      this.hitstopRemaining--;
      this.callbacks.onRender();
      this.scheduleNext();
      return;
    }

    this.world.invalidateCache();
    this.systems.update(this.world, 1);
    this.events.flush();
    this.tick++;

    this.callbacks.onTick(this.tick);
    this.callbacks.onRender();
    this.scheduleNext();
  }
}
