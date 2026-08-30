# dsh-sidebar-gdhighlight

DSH plugin: GDScript syntax highlighting for [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar).

[![npm version](https://img.shields.io/npm/v/dsh-sidebar-gdhighlight)](https://www.npmjs.com/package/dsh-sidebar-gdhighlight)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- Full GDScript 4.x syntax highlighting
- CodeMirror 6 integration with dsh-better-sidebar
- Supports all GDScript keywords, types, built-in functions, and annotations
- Handles multi-line strings (`"""`), comments (`#`), and string interpolation (`$""`)
- Custom syntax coloring for Godot-specific features

## 🚀 Installation

### Prerequisites

- DSH installed and running (`dsh web` works)
- [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) installed

### Install

```sh
dsh plugin --profile web add dsh-sidebar-gdhighlight@latest
```

After installation, **hard refresh** your browser (Cmd/Ctrl+Shift+R).

### Manual Installation

1. Clone the repository:

```sh
git clone https://github.com/lrplrplrp/dsh-sidebar-gdhighlight.git
cd dsh-sidebar-gdhighlight
pnpm install
pnpm build
```

2. Link to your DSH profile:

```sh
# Add to ~/.dsh/profiles/web/package.json dependencies:
# "dsh-sidebar-gdhighlight": "link:/path/to/dsh-sidebar-gdhighlight"

cd ~/.dsh/profiles/web
pnpm install
```

3. Add to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: gdscript-highlight
      name: 'dsh-sidebar-gdhighlight'
```

4. Hard refresh browser (Cmd/Ctrl+Shift+R).

## 🔧 Development

```sh
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm watch
```

## 📝 Supported Syntax

| Element | Examples |
|---------|----------|
| Keywords | `func`, `class`, `extends`, `var`, `const`, `if/elif/else`, `for/while`, `match`, `signal`, `export`, `onready`, `await` |
| Types | `int`, `float`, `String`, `bool`, `Array`, `Dictionary`, `Vector2/3/4`, `Color`, `Node`, `Resource` |
| Built-ins | `print`, `str`, `range`, `load`, `preload`, `get_tree`, `get_node`, `typeof`, `lerp`, `clamp` |
| Annotations | `@export`, `@onready`, `@tool`, `@icon` |
| Comments | Single-line `#`, Multi-line `#"""..."""#` |
| Strings | `"..."`, `'...'`, `$"..."`, `"""..."""` |
| Numbers | `123`, `0.5`, `0xFF`, `0b1010`, `0o77` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related

- [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) - The main sidebar plugin
- [DSH](https://github.com/deepseek-ai/deepseek-harness) - DeepSeek Harness
- [Godot Engine](https://godotengine.org/) - The game engine

## 🙏 Acknowledgments

- Thanks to the [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) team for the excellent plugin architecture
- Thanks to the Godot Engine team for creating GDScript
- Thanks to the CodeMirror team for the amazing code editor
