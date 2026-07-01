export type Layout = {
  // box: size (absent = auto)
  width?: number;
  height?: number;
  maxWidth?: number;
  // edges + shorthands
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  inset?: number;
  insetX?: number;
  insetY?: number;
  // margins + shorthands
  marginLeft?: number | "auto";
  marginTop?: number | "auto";
  marginRight?: number | "auto";
  marginBottom?: number | "auto";
  margin?: number | "auto";
  marginX?: number | "auto";
  marginY?: number | "auto";
  // flex
  direction?: "row" | "column";
  gap?: number;
  justifyContent?: "start" | "center" | "end";
  alignItems?: "start" | "center" | "end" | "stretch";
  // depth
  zIndex?: number;
};
