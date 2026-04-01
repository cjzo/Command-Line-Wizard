export class HitstopManager {
  private ticksRemaining = 0;

  trigger(duration: number): void {
    this.ticksRemaining = Math.max(this.ticksRemaining, duration);
  }

  shouldPause(): boolean {
    if (this.ticksRemaining > 0) {
      this.ticksRemaining--;
      return true;
    }
    return false;
  }

  isActive(): boolean {
    return this.ticksRemaining > 0;
  }
}
