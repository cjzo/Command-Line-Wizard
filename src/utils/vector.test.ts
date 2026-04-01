import { describe, it, expect } from "vitest";
import { vec2, add, sub, scale, magnitude, distance, normalize, equals, clampToGrid } from "./vector.js";

describe("Vec2", () => {
  it("should create vectors", () => {
    const v = vec2(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });

  it("should add vectors", () => {
    const result = add(vec2(1, 2), vec2(3, 4));
    expect(result).toEqual({ x: 4, y: 6 });
  });

  it("should subtract vectors", () => {
    const result = sub(vec2(5, 7), vec2(2, 3));
    expect(result).toEqual({ x: 3, y: 4 });
  });

  it("should scale vectors", () => {
    const result = scale(vec2(3, 4), 2);
    expect(result).toEqual({ x: 6, y: 8 });
  });

  it("should calculate magnitude", () => {
    expect(magnitude(vec2(3, 4))).toBe(5);
    expect(magnitude(vec2(0, 0))).toBe(0);
  });

  it("should calculate distance", () => {
    expect(distance(vec2(0, 0), vec2(3, 4))).toBe(5);
  });

  it("should normalize vectors", () => {
    const n = normalize(vec2(0, 5));
    expect(n.x).toBeCloseTo(0);
    expect(n.y).toBeCloseTo(1);

    const zero = normalize(vec2(0, 0));
    expect(zero).toEqual({ x: 0, y: 0 });
  });

  it("should compare vectors for equality", () => {
    expect(equals(vec2(1, 2), vec2(1, 2))).toBe(true);
    expect(equals(vec2(1, 2), vec2(2, 1))).toBe(false);
  });

  it("should clamp to grid bounds", () => {
    expect(clampToGrid(vec2(-1, -1), 10, 10)).toEqual({ x: 0, y: 0 });
    expect(clampToGrid(vec2(15, 15), 10, 10)).toEqual({ x: 9, y: 9 });
    expect(clampToGrid(vec2(5, 5), 10, 10)).toEqual({ x: 5, y: 5 });
  });
});
