export type Rect = { x: number; y: number; w: number; h: number }
export type Size = { w: number; h: number }

export interface Node {
  box: { right?: number; bottom?: number }
  rect: Rect
  intrinsic?: Size
  onLayout?: (rect: Rect) => void
}

export function createNode(partial: Partial<Omit<Node, 'rect'>>): Node {
  return {
    box: partial.box ?? {},
    rect: { x: NaN, y: NaN, w: NaN, h: NaN },
    intrinsic: partial.intrinsic,
    onLayout: partial.onLayout,
  }
}
