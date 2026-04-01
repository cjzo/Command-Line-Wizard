export interface Vec2 {
  x: number;
  y: number;
}

export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

export function magnitude(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function distance(a: Vec2, b: Vec2): number {
  return magnitude(sub(a, b));
}

export function manhattanDistance(a: Vec2, b: Vec2): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function normalize(v: Vec2): Vec2 {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

export function equals(a: Vec2, b: Vec2): boolean {
  return a.x === b.x && a.y === b.y;
}

export function clampToGrid(v: Vec2, width: number, height: number): Vec2 {
  return {
    x: Math.max(0, Math.min(width - 1, v.x)),
    y: Math.max(0, Math.min(height - 1, v.y)),
  };
}

export function roundVec(v: Vec2): Vec2 {
  return { x: Math.round(v.x), y: Math.round(v.y) };
}
