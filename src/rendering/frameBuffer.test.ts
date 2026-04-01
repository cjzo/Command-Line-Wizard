import { describe, it, expect, beforeEach } from "vitest";
import { FrameBuffer } from "./frameBuffer.js";

describe("FrameBuffer", () => {
  let buffer: FrameBuffer;

  beforeEach(() => {
    buffer = new FrameBuffer(10, 5);
  });

  it("should initialize with empty cells", () => {
    const cell = buffer.read(0, 0);
    expect(cell).toBeDefined();
    expect(cell!.char).toBe(" ");
    expect(cell!.fg).toBe("white");
  });

  it("should write and read cells", () => {
    buffer.write(3, 2, "@", "cyan", "", 40);
    const cell = buffer.read(3, 2);
    expect(cell!.char).toBe("@");
    expect(cell!.fg).toBe("cyan");
    expect(cell!.layer).toBe(40);
  });

  it("should respect layer ordering (higher layer wins)", () => {
    buffer.write(5, 3, "a", "red", "", 10);
    buffer.write(5, 3, "b", "blue", "", 20);

    const cell = buffer.read(5, 3);
    expect(cell!.char).toBe("b");
    expect(cell!.fg).toBe("blue");
  });

  it("should not overwrite with lower layer", () => {
    buffer.write(5, 3, "a", "red", "", 20);
    buffer.write(5, 3, "b", "blue", "", 10);

    const cell = buffer.read(5, 3);
    expect(cell!.char).toBe("a");
  });

  it("should ignore out-of-bounds writes", () => {
    buffer.write(-1, 0, "x", "red", "", 10);
    buffer.write(0, -1, "x", "red", "", 10);
    buffer.write(10, 0, "x", "red", "", 10);
    buffer.write(0, 5, "x", "red", "", 10);
    // Should not throw
  });

  it("should return undefined for out-of-bounds reads", () => {
    expect(buffer.read(-1, 0)).toBeUndefined();
    expect(buffer.read(10, 0)).toBeUndefined();
  });

  it("should clear all cells", () => {
    buffer.write(3, 2, "@", "cyan", "", 40);
    buffer.clear();

    const cell = buffer.read(3, 2);
    expect(cell!.char).toBe(" ");
    expect(cell!.layer).toBe(-1);
  });

  it("should snapshot cells as independent copies", () => {
    buffer.write(0, 0, "@", "cyan", "", 40);
    const snap = buffer.snapshot();

    buffer.write(0, 0, "X", "red", "", 50);

    expect(snap[0][0].char).toBe("@");
    expect(buffer.read(0, 0)!.char).toBe("X");
  });
});
