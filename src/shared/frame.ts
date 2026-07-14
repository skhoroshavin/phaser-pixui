import { Textures } from "phaser";

/**
 * Extracts layout dimensions from a Phaser texture frame's metadata.
 *
 * Checks the frame's `customData` for source size and 9-slice border metadata
 * (typically from a sprite sheet editor like Texture Packer). Falls back to the
 * Phaser frame's built-in dimensions if custom data is unavailable.
 *
 * Use this to determine a frame's natural size and whether it supports 9-slice
 * scaling.
 *
 * @param frame - The Phaser texture frame to analyze
 * @returns {@link FrameDimensions} with width, height, and scalability flags
 */
export function frameDimensions(frame: Textures.Frame): FrameDimensions {
  type size = { w: number; h: number };
  const data = frame.customData as
    | {
        frame: size;
        scale9Borders?: size;
        sourceSize?: size;
      }
    | undefined;

  const frameSize = data?.sourceSize ?? data?.frame;
  const width = frameSize?.w ?? frame.width;
  const height = frameSize?.h ?? frame.height;
  const scalableSize = data?.scale9Borders ?? { w: width, h: height };

  return {
    width: width,
    height: height,
    scalableX: scalableSize.w < width,
    scalableY: scalableSize.h < height,
    minWidth: width - scalableSize.w,
    minHeight: height - scalableSize.h,
  };
}

/**
 * Dimension metadata for a texture frame.
 *
 * @property width - The frame's source width in pixels
 * @property height - The frame's source height in pixels
 * @property scalableX - `true` if the frame supports 9-slice scaling horizontally
 * @property scalableY - `true` if the frame supports 9-slice scaling vertically
 * @property minWidth - Minimum width (fixed left+right borders); 0 if not horizontally scalable
 * @property minHeight - Minimum height (fixed top+bottom borders); 0 if not vertically scalable
 */
export type FrameDimensions = {
  width: number;
  height: number;
  scalableX: boolean;
  scalableY: boolean;
  minWidth: number;
  minHeight: number;
};
