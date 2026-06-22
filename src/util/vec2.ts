/** Simple 2D vector with x and y components. */
export type vec2 = { x: number; y: number };

/** Adds two vectors component-wise. */
export function add(v1: vec2, v2: vec2): vec2 {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/** Subtracts v2 from v1 component-wise. */
export function sub(v1: vec2, v2: vec2): vec2 {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

/** Scales a vector by a scalar value. */
export function scale(v: vec2, s: number): vec2 {
  return { x: v.x * s, y: v.y * s };
}

/** Returns the length of a vector. */
export function len(v: vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}
