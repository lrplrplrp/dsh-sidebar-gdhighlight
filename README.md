# dsh-sidebar-gdhighlight

[简体中文](README.zh.md) | English

DSH plugin: GDScript & GDShader syntax highlighting for [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar), using Godot 4.7 editor colors.

[![npm version](https://img.shields.io/npm/v/dsh-sidebar-gdhighlight)](https://www.npmjs.com/package/dsh-sidebar-gdhighlight)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **GDScript 4.x** full syntax highlighting (`.gd` files, `.inc` include files)
- **GDShader** shader syntax highlighting (`.gdshader` / `.shader` files)
- **Godot 4.7 editor colors** — colors extracted from `editor_settings-4.7.tres`
- CodeMirror 6 integration with dsh-better-sidebar
- Support for all GDScript keywords, control flow, types, built-in functions, and annotations
- Function definition highlighting (`func name()` uses a dedicated definition color)
- Multi-line strings (`"""`), string interpolation (`$""`), node paths (`$Node`, `%Unique`), string names (`&"Name"`)
- GDShader `uniform`/`varying`, built-in variables (`ALBEDO`, `VERTEX`, etc.), GLSL math functions

## 🎨 Godot Color Mapping

This plugin uses your actual Godot editor color scheme:

| Element | Godot Setting Key | Sample Color |
|---------|------------------|-------------|
| Keywords | `keyword_color` | `#FF7084` |
| Control flow | `control_flow_keyword_color` | `#FF8CCC` |
| Base types | `base_type_color` | `#42FFC2` |
| Engine types | `engine_type_color` | `#8FFFDB` |
| Comments | `comment_color` | Semi-transparent white |
| Doc comments | `doc_comment_color` | Blue-gray |
| Strings | `string_color` | `#FFED9E` |
| String placeholders | `string_placeholder_color` | `#FFBF66` |
| Numbers | `number_color` | `#A0FFE0` |
| Function calls | `function_color` | `#57B3FF` |
| Function definitions | `function_definition_color` | `#66E6FF` |
| Global functions | `global_function_color` | `#A3A3F5` |
| Member variables | `member_variable_color` | `#BDE1FF` |
| Annotations | `annotation_color` | `#FFB373` |
| Node paths | `node_path_color` | `#B8C47D` |
| Node references | `node_reference_color` | `#63C25A` |

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

### GDScript (`.gd` / `.inc`)

| Element | Examples |
|---------|----------|
| Keywords | `func`, `class`, `extends`, `var`, `const`, `signal`, `enum`, `preload`, `load` |
| Control flow | `if`, `elif`, `else`, `for`, `while`, `match`, `return`, `break`, `continue`, `pass` |
| Base types | `int`, `float`, `String`, `bool`, `Array`, `Dictionary`, `Vector2/3/4`, `Color`, `NodePath` |
| Engine types | `Node`, `Sprite2D`, `Button`, `Camera3D`, `AnimationPlayer`, `HTTPRequest`, ... |
| Built-ins | `print`, `str`, `range`, `load`, `preload`, `get_tree`, `get_node`, `typeof`, `lerp`, `clamp` |
| Annotations | `@export`, `@onready`, `@tool`, `@icon`, `@warning_ignore` |
| Comments | Single-line `#`, Multi-line `#"""..."""#` |
| Strings | `"..."`, `'...'`, `$"..."`, `"""..."""`, `&"StringName"` |
| Node paths | `$Node/Path`, `%UniqueNode` |
| Numbers | `123`, `0.5`, `0xFF`, `0b1010`, `0o77` |

### GDShader (`.gdshader` / `.shader`)

| Element | Examples |
|---------|----------|
| Keywords | `shader_type`, `render_mode`, `uniform`, `varying`, `const`, `in`, `out` |
| Control flow | `if`, `else`, `for`, `while`, `switch`, `return`, `discard` |
| Types | `float`, `int`, `vec2/3/4`, `mat2/3/4`, `sampler2D`, `bool` |
| Built-in vars | `VERTEX`, `ALBEDO`, `UV`, `COLOR`, `NORMAL`, `EMISSION`, `DIFFUSE_LIGHT`, ... |
| Built-in funcs | `sin`, `cos`, `texture`, `normalize`, `dot`, `cross`, `mix`, `smoothstep`, ... |
| Comments | Single-line `//`, Block `/* ... */` |

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
- Thanks to the Godot Engine team for creating GDScript and Godot Shading Language
- Thanks to the CodeMirror team for the code editor framework
