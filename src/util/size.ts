
// Describes size of component, either absolute or relative to parent
export type RelativeSize = {
    // Positive indicates absolute width, zero or negative indicates width
    // relative to parent (parentWidth + width), undefined is treated as zero
    width?: number
    // Positive indicates absolute height, zero or negative indicates height
    // relative to parent (parentHeight + height), undefined is treated as zero
    height?: number
}

// Describes absolute size of component
export type Size = {
    width: number
    height: number
}

// Calculates absolute size, based on potentially relative size and parent absolute size
export function calcSize(s: RelativeSize, parent: Size): Size {
    return {
        width: absDimension(s.width, parent.width),
        height: absDimension(s.height, parent.height),
    }
}

function absDimension(value: number | undefined, parent: number): number {
    if (value === undefined) value = 0;
    if (value > 0) return value;
    return parent + value;
}
