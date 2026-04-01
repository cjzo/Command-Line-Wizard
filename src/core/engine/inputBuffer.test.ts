import { beforeEach, describe, expect, it, vi } from "vitest";
import { InputBuffer } from "./inputBuffer.js";

describe("InputBuffer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
  });

  it("keeps movement active for the lease duration", () => {
    const input = new InputBuffer(200);

    input.press("right");
    expect(input.consume().right).toBe(true);

    vi.advanceTimersByTime(150);
    expect(input.consume().right).toBe(true);

    vi.advanceTimersByTime(60);
    expect(input.consume().right).toBe(false);
  });

  it("treats action keys as one-shot inputs", () => {
    const input = new InputBuffer(200);

    input.press("ability1");
    expect(input.consume().ability1).toBe(true);
    expect(input.consume().ability1).toBe(false);
  });

  it("refreshes movement while repeats keep arriving", () => {
    const input = new InputBuffer(180);

    input.press("down");
    vi.advanceTimersByTime(120);
    input.press("down");
    vi.advanceTimersByTime(120);

    expect(input.consume().down).toBe(true);

    vi.advanceTimersByTime(181);
    expect(input.consume().down).toBe(false);
  });

  it("supports explicit release for movement keys", () => {
    const input = new InputBuffer(200);

    input.press("left");
    input.release("left");

    expect(input.consume().left).toBe(false);
  });
});
