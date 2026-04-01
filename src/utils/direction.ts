import type { Vec2 } from "./vector.js";

export type Direction = "up" | "down" | "left" | "right";

const DIRECTION_VECTORS: Record<Direction, Vec2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function directionToVec(dir: Direction): Vec2 {
  return DIRECTION_VECTORS[dir];
}

export function oppositeDirection(dir: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  return opposites[dir];
}

export function vecToDirection(v: Vec2): Direction | null {
  if (v.x === 0 && v.y === 0) return null;
  if (Math.abs(v.x) >= Math.abs(v.y)) {
    return v.x > 0 ? "right" : "left";
  }
  return v.y > 0 ? "down" : "up";
}

export const ALL_DIRECTIONS: readonly Direction[] = [
  "up",
  "down",
  "left",
  "right",
] as const;
