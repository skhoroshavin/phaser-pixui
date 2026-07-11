# Phaser PixUI

A UI library for the Phaser game engine, built with pixel-art games in mind.
Implements a subset of the CSS layout and a rich set of composable
UI components.

## Features

- A faithful implementation of a subset of the CSS layout: box model,
  padding and margins (including auto), edge anchoring with overflow fallbacks,
  flexbox with grow, and `zIndex`
- Components `Button`, `Toggle`, `Slider`, `RadioGroup`, `ScrollArea`, `Modal`,
  and primitives `Image`, `MultiImage`, `Rectangle`, `Text`, `Interactive`
- UI trees can be mounted to a whole scene, or attached to any Phaser `GameObject`
  and automatically follow it
- Written in TypeScript with full type definitions

## Design principles

- Easy to use and hard to misuse library API
- Does not dictate the architecture of your application or scene.
- Layout system familiar to anyone with CSS experience, also robust enough to
  handle pixel-art edge cases.
- Composable core components to easily build higher-level game-specific
  components.
- No built-in look or theme; appearance is fully defined by the assets used.
- Performance is a priority. A deep component tree still renders to flat
  Phaser game object lists for static elements, and dynamic elements use
  direct coordinate updates without triggering layout resolution.

## Installation and usage

```bash
npm install phaser-pixui
```

Requires Phaser 4 as a peer dependency:

```bash
npm install phaser@^4.1.0
```

For a usage example, see the bundled [example](https://github.com/skhoroshavin/phaser-pixui/tree/main/example)
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
