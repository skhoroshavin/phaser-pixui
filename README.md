# Phaser PixUI

A UI library for the Phaser game engine that provides responsive and customizable UI components, tailored specifically for pixel art games.

## Features

- Responsive UI components that adapt to different screen sizes
- Ensures integer scaling to keep pixel art crisp
- Customizable themes and styling
- Easy integration with Phaser scenes
- Support for buttons, progress bars, text areas, and more
- Built-in positioning helpers for common screen locations
- Scrollable text areas for logs and messages
- Written in TypeScript with full type definitions

## Installation

```bash
npm install phaser-pixui
```

**Peer Dependency Notice**: This library requires Phaser 4. Make sure you have it installed in your project:

```bash
npm install phaser@^4.0.0-rc.6
```

## Basic Usage

Check the bundled [example](https://github.com/skhoroshavin/phaser-pixui/tree/main/example) project.

## Development

### Building the Library

```bash
npm run build
```

### Running the Example

First, build the library:

```bash
npm run build
```

Then run the example:

```bash
npm run example
```

Or install example dependencies first if needed:

```bash
npm run example:install
npm run example
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Create a Pull Request

## License

- **Code**: MIT License - Feel free to use, modify, and distribute the code in your projects
- **Art Assets**: CC0 License - Art assets are free to use for any purpose with attribution to Gabriel Lima (aka [tiopalada](https://tiopalada.itch.io)). Big thanks to him for creating the beautiful pixel art assets used in the examples.
