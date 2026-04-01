import type { World } from "../core/ecs/types.js";
import type { PositionComponent } from "../components/position.js";
import type { RenderableComponent } from "../components/renderable.js";
import { FrameBuffer } from "./frameBuffer.js";

export class GameRenderer {
  private buffer: FrameBuffer;
  private shakeOffsetX = 0;
  private shakeOffsetY = 0;

  constructor(width: number, height: number) {
    this.buffer = new FrameBuffer(width, height);
  }

  setShakeOffset(x: number, y: number): void {
    this.shakeOffsetX = x;
    this.shakeOffsetY = y;
  }

  render(world: World): FrameBuffer {
    this.buffer.clear();

    const renderables = world.query("position", "renderable");

    const sorted = renderables
      .map((id) => ({
        id,
        pos: world.getComponent<PositionComponent>(id, "position")!,
        ren: world.getComponent<RenderableComponent>(id, "renderable")!,
      }))
      .filter((e) => e.ren.visible)
      .sort((a, b) => a.ren.layer - b.ren.layer);

    for (const entity of sorted) {
      const drawX = Math.round(entity.pos.x) + this.shakeOffsetX;
      const drawY = Math.round(entity.pos.y) + this.shakeOffsetY;
      this.buffer.write(
        drawX,
        drawY,
        entity.ren.char,
        entity.ren.fg,
        entity.ren.bg,
        entity.ren.layer,
      );
    }

    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    return this.buffer;
  }

  getBuffer(): FrameBuffer {
    return this.buffer;
  }
}
