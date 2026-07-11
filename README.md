# Phaser PixUI

A lightweight, but flexible UI library for the Phaser game engine,
built with pixel-art games in mind.

## Features

- A faithful implementation of a subset of the CSS layout: box model with
  padding and margins, edge anchoring with overflow fallbacks, z-index,
  and, last but not least, flexbox including gaps, justify-content,
  align-items and grow, all interacting correctly with auto margins.
- Components ranging from primitives like Image and Text to more complex
  containers like ScrollArea and Modal, to fully customizable controls
  like Button, Toggle, RadioGroup and Slider.
- UI trees can be statically mounted to any Phaser Scene, or attached
  to a Phaser GameObject and automatically follow it
- Written in TypeScript with full type definitions

## Design principles

- Easy to use strongly typed library API
- Does not dictate the architecture of your application or scene.
- Layout system familiar to anyone with CSS experience
- Composable to easily build game-specific components.
- No built-in look or theme; appearance is fully defined by the assets used.

Highly performant:

- Deep static component trees are flattened into plain GameObject lists
- Layout resolution runs on demand, not every frame
- Highly dynamic elements like slider thumbs or scrollable content are handled
  without needing to resolve layout
- Elements requiring frequent layout resolution, like dynamic text, can be made
  part of a separate tree, to avoid resolving the whole UI on their updates

## Getting started

```bash
npm install phaser-pixui
```

Requires Phaser 4 as a peer dependency:

```bash
npm install phaser@^4.0.0
```

Create a `SceneMount` attached to your scene, which acts as a root container,
and add your components directly to it:

```ts
import { Component, SceneMount, Rectangle, Text } from "phaser-pixui";

const mount = new SceneMount(scene, {
  viewport: () => ({ width: 320, height: 240 }),
});

const row = mount.add(Component, { direction: "row", gap: 8, alignItems: "center" });
row.add(Rectangle, { width: 40, height: 40, fillColor: 0xff0000 });
row.add(Text, { font: "myFont", text: "Hello" });
```

Layout is a subset of CSS. Children flow in a column by default; `direction: "row"`
makes a row. Use `gap`, `justifyContent`, `alignItems`, and `grow` as in flexbox.
Setting any of `left`/`top`/`right`/`bottom` (or `inset`) anchors a child and takes
it out of flow. `margin: "auto"` absorbs free space, which is handy for centering.

To attach a UI to a game object so it follows the object around the world, use a
`GameObjectMount` instead of a `SceneMount`:

```ts
import { GameObjectMount, Text } from "phaser-pixui";

const mount = new GameObjectMount(scene, npc);
mount.add(Text, { font: "myFont", text: "Hello", bottom: 32 });
```

For a complete example with themed buttons, sliders, modals, and scroll areas,
see the bundled [example](https://github.com/skhoroshavin/phaser-pixui/tree/main/example)
project and its [demo page](https://skhoroshavin.itch.io/phaser-pixui).

## Development

```bash
npm run build           # build the library
npm run example         # run the example (build library first)
npm run example:install # install example dependencies
npm test                # unit + visual tests
npm run test:install    # install Playwright browsers
```

## License

### Code

Copyright (c) 2026 Sergei Khoroshavin. Licensed under MIT.
See [LICENSE](https://github.com/skhoroshavin/phaser-pixui/blob/main/LICENSE)
for the full license text.

### Example art assets

The example app includes third-party assets that are **not** part of the core
library — they are for demonstration only:

**Minifantasy** — UI sprites by [Krishna Palacio](https://krishna-palacio.itch.io),
from a subset of [Minifantasy UI Overhaul](https://krishna-palacio.itch.io/minifantasy-ui-overhaul),
used under a commercial license with a special exception for this project.
You must credit Krishna Palacio if you use these assets, and you may not
redistribute them. Purchasing the
[original asset pack](https://krishna-palacio.itch.io/minifantasy-ui-overhaul)
for access to the full sprite set is still recommended.

**Pyrious** — `pypx` bitmap font by Ben Frankel
([Pyrious](https://pyrious.itch.io)), CC0.

**tiopalada** — background image, bitmap fonts, and older UI assets by
Gabriel Lima ([tiopalada](https://tiopalada.itch.io)), CC0. Source packs:
[Tiny RPG Battle Kit I](https://tiopalada.itch.io/tiny-rpg-battle-kit-1),
[Mana Soul GUI](https://tiopalada.itch.io/tiny-rpg-mana-soul-gui),
[Tiny RPG Font Kit II](https://tiopalada.itch.io/tiny-rpg-font-kit-ii).

Full attribution and license details: [example/assets/LICENSE](https://github.com/skhoroshavin/phaser-pixui/blob/main/example/assets/LICENSE).
