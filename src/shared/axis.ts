export type Axis = "x" | "y";

export function axisLock(axis: Axis | undefined, x: number, y: number): { x: number; y: number } {
  switch (axis) {
    case "x":
      return { x, y: 0 };
    case "y":
      return { x: 0, y };
    default:
      return { x, y };
  }
}
