import { GameWorld } from "../ecs/world.js";
import { EventBus } from "../events/eventBus.js";
import { SystemRunner } from "./systemRunner.js";
import { GameLoop } from "./gameLoop.js";
import { InputBuffer } from "./inputBuffer.js";
import { GameRenderer } from "../../rendering/renderer.js";
import type { Cell } from "../../rendering/frameBuffer.js";
import type { GameConfig } from "../../config/defaults.js";
import type { System } from "../ecs/types.js";
import { logger } from "../../utils/logger.js";

export class GameEngine {
  readonly world: GameWorld;
  readonly events: EventBus;
  readonly input: InputBuffer;
  readonly renderer: GameRenderer;
  private systemRunner: SystemRunner;
  private loop: GameLoop;
  private onFrameCallback: ((cells: Cell[][], tick: number) => void) | null = null;

  constructor(private config: GameConfig) {
    this.world = new GameWorld();
    this.events = new EventBus();
    this.input = new InputBuffer(Math.max(config.tickMs * 2, 180));
    this.systemRunner = new SystemRunner();
    this.renderer = new GameRenderer(config.grid.width, config.grid.height);
    this.loop = new GameLoop(
      this.world,
      this.systemRunner,
      this.events,
      config.tickMs,
      {
        onTick: (tick) => {
          logger.debug(`Tick ${tick}`);
        },
        onRender: () => {
          const buffer = this.renderer.render(this.world);
          if (this.onFrameCallback) {
            this.onFrameCallback(buffer.snapshot(), this.loop.getTick());
          }
        },
      },
    );
  }

  registerSystem(system: System): void {
    this.systemRunner.register(system);
  }

  resetSystems(): void {
    this.systemRunner.clear();
    this.input.reset();
  }

  onFrame(callback: (cells: Cell[][], tick: number) => void): void {
    this.onFrameCallback = callback;
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  isRunning(): boolean {
    return this.loop.isRunning();
  }

  applyHitstop(ticks: number): void {
    this.loop.applyHitstop(ticks);
  }

  getConfig(): GameConfig {
    return this.config;
  }

  getTick(): number {
    return this.loop.getTick();
  }
}
