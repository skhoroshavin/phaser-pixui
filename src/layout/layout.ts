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
  // padding + shorthands (absent = 0)
  paddingLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  // margins + shorthands (absent = 0)
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
