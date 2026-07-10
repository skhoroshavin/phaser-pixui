export type Rect = { x: number; y: number; width: number; height: number };

export function fits(r: Rect, bounds: Rect): boolean {
  return (
    r.x >= bounds.x &&
    r.y >= bounds.y &&
    r.x + r.width <= bounds.x + bounds.width &&
    r.y + r.height <= bounds.y + bounds.height
  );
}
