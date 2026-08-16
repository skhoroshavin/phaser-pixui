# Changelog

## Unreleased

### Changed

- A positioned child wider than its parent with both edges and `auto` margins
  now stays centered, overflowing both sides. This is a deviation from CSS,
  but it is consistent with already existing deviations that enable robust
  centering of absolutely positioned elements using auto margins.

### Fixed

- `GameObjectMount` without a target rendered its tree at the origin; now
  hidden until a target is attached
- `GameObjectTarget` definition was too strict, making it impossible to attach
  `GameObjectMount` to some valid Phaser objects, like `Rectangle`; now it
  accepts them

## 0.3.0

Complete rewrite of the library. The theme system, styled components, and
custom resource loading are gone; the library is now a layout engine plus
a set of headless components.

### Layout engine

- CSS subset: box model with padding and margins (including `auto` margins),
  edge anchoring with `inset` shorthands and overflow fallbacks
  (`positionTryFallbacks`), `zIndex`, and `maxWidth`
- Flexbox: `direction`, `gap`, `justifyContent`, `alignItems`, and `grow`,
  interacting correctly with auto margins
- Text wraps to assigned width instead of overflowing
- Layout resolution is deferred and runs at most once per frame, before
  rendering

### Components

- Primitives: `Container`, `Image` (with 9-slice scaling), `Rectangle`,
  `Text` (bitmap), `Interactive`
- Widgets: `Button`, `Toggle`, `RadioGroup`, `Slider`, `ProgressBar`,
  `PageStack`, `Modal`, `ScrollArea`
- Widgets are headless: no built-in look, appearance is fully defined by
  the assets used
- Input behaviours: `Clickable`, `Hoverable`, `Draggable`, `Scrollable`
- Mounts: `SceneMount`, `GameObjectMount` (follows a game object),
  `MaskMount` (useful for implementing scroll areas)
- `ResponsiveScene` helper with viewport constraints and integer zoom

### Packaging

- Fully tree-shakeable (`sideEffects: false`)
- Complete API documentation in type declarations

### Breaking changes

- Complete rewrite: no API is shared with 0.2.x

### Pre-0.3 history

- 0.2.x and earlier: themed UI library with styled components - see git history
