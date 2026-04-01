import type { GameRenderer } from "../renderer.js";
import { rng } from "../../utils/random.js";

export class ScreenShakeManager {
  private shakeTicksRemaining = 0;
  private intensity = 0;

  trigger(intensity: number, duration: number): void {
    this.intensity = Math.max(this.intensity, intensity);
    this.shakeTicksRemaining = Math.max(this.shakeTicksRemaining, duration);
  }

  apply(renderer: GameRenderer): void {
    if (this.shakeTicksRemaining <= 0) return;

    const dx = rng().nextInt(-this.intensity, this.intensity);
    const dy = rng().nextInt(-Math.min(this.intensity, 1), Math.min(this.intensity, 1));

    renderer.setShakeOffset(dx, dy);
    this.shakeTicksRemaining--;

    if (this.shakeTicksRemaining <= 0) {
      this.intensity = 0;
    }
  }

  isShaking(): boolean {
    return this.shakeTicksRemaining > 0;
  }
}
