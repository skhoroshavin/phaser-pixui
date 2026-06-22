export type Rect = { x: number; y: number; w: number; h: number }
export type Size = { w: number; h: number }

export interface Node {
  box: { right?: number; bottom?: number }
  children: Node[]
  rect: Rect
  intrinsic?: Size
  onLayout?: (rect: Rect) => void
}

export function createNode(partial: Partial<Omit<Node, 'rect'>>): Node {
  return {
    box: partial.box ?? {},
    children: partial.children ?? [],
    rect: { x: NaN, y: NaN, w: NaN, h: NaN },
    intrinsic: partial.intrinsic,
    onLayout: partial.onLayout,
  }
}

export function resolve(root: Node): void {
  for (const child of root.children) {
    const w = child.intrinsic?.w ?? 0
    const h = child.intrinsic?.h ?? 0

    const x = child.box.right !== undefined
      ? root.rect.w - child.box.right - w
      : 0
    const y = child.box.bottom !== undefined
      ? root.rect.h - child.box.bottom - h
      : 0

    const rect = { x, y, w, h }
    if (
      rect.x !== child.rect.x || rect.y !== child.rect.y ||
      rect.w !== child.rect.w || rect.h !== child.rect.h
    ) {
      child.rect = rect
      child.onLayout?.(child.rect)
    }
  }
}
