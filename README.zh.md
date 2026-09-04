# dsh-sidebar-gdhighlight

简体中文 | [English](README.md)

DSH 插件：为 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 提供 GDScript 与 GDShader 语法高亮支持，使用 Godot 4.7 编辑器配色。

[![npm version](https://img.shields.io/npm/v/dsh-sidebar-gdhighlight)](https://www.npmjs.com/package/dsh-sidebar-gdhighlight)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

- **GDScript 4.x** 完整语法高亮（`.gd` 文件、`.inc` 包含文件）
- **GDShader** 着色器语法高亮（`.gdshader` / `.shader` 文件）
- **Godot 4.7 编辑器配色** — 直接从 `editor_settings-4.7.tres` 提取颜色
- CodeMirror 6 集成 dsh-better-sidebar
- 支持所有 GDScript 关键字、控制流、类型、内置函数和注解
- 支持多行字符串（`"""`）、字符串插值（`$"..."`）、节点路径（`$Node`、`%Unique`）、字符串名（`&"Name"`）
- 支持函数/变量/信号/枚举定义高亮（`func name()` 使用专门的定义颜色）
- **选区"添加到对话"** — 选中代码后弹出按钮，将选中内容以围栏代码块插入对话输入框
- 支持 GDShader 的 `uniform`/`varying`、内置变量（`ALBEDO`、`VERTEX` 等）、GLSL 数学函数

## 🎨 Godot 配色映射

本插件使用你 Godot 编辑器中的实际配色方案：

| 语法元素 | Godot 设置键 | 示例颜色 |
|---------|-------------|---------|
| 关键字 | `keyword_color` | `#FF7084` |
| 控制流关键字 | `control_flow_keyword_color` | `#FF8CCC` |
| 基础类型 | `base_type_color` | `#42FFC2` |
| 引擎类型 | `engine_type_color` | `#8FFFDB` |
| 注释 | `comment_color` | 半透明白色 |
| 文档注释 | `doc_comment_color` | 蓝灰色 |
| 字符串 | `string_color` | `#FFED9E` |
| 字符串占位符 | `string_placeholder_color` | `#FFBF66` |
| 数字 | `number_color` | `#A0FFE0` |
| 函数调用 | `function_color` | `#57B3FF` |
| 函数定义 | `function_definition_color` | `#66E6FF` |
| 全局函数 | `global_function_color` | `#A3A3F5` |
| 成员变量 | `member_variable_color` | `#BDE1FF` |
| 注解 | `annotation_color` | `#FFB373` |
| 节点路径 | `node_path_color` | `#B8C47D` |
| 节点引用 | `node_reference_color` | `#63C25A` |

## 🚀 安装

### 前置条件

- 已安装并运行 DSH（`dsh web` 正常工作）
- 已安装 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar)

### 安装

```sh
dsh plugin --profile web add dsh-sidebar-gdhighlight@latest
```

安装完成后，**硬刷新**浏览器（Cmd/Ctrl+Shift+R）。

### 手动安装

1. 克隆仓库：

```sh
git clone https://github.com/lrplrplrp/dsh-sidebar-gdhighlight.git
cd dsh-sidebar-gdhighlight
pnpm install
pnpm build
```

2. 链接到 DSH 配置目录：

```sh
# 在 ~/.dsh/profiles/web/package.json 的 dependencies 中添加：
# "dsh-sidebar-gdhighlight": "link:/path/to/dsh-sidebar-gdhighlight"

cd ~/.dsh/profiles/web
pnpm install
```

3. 在 `~/.dsh/profiles/web/cordis.patch.yml` 中添加：

```yaml
- insert:
    - id: gdscript-highlight
      name: 'dsh-sidebar-gdhighlight'
```

4. 硬刷新浏览器（Cmd/Ctrl+Shift+R）。

## 🔧 开发

```sh
# 安装依赖
pnpm install

# 构建
pnpm build

# 监听模式
pnpm watch
```

## 📝 支持的语法

### GDScript (`.gd` / `.inc`)

| 元素 | 示例 |
|------|------|
| 关键字 | `func`, `class`, `extends`, `var`, `const`, `signal`, `enum`, `preload`, `load` |
| 控制流 | `if`, `elif`, `else`, `for`, `while`, `match`, `return`, `break`, `continue`, `pass` |
| 基础类型 | `int`, `float`, `String`, `bool`, `Array`, `Dictionary`, `Vector2/3/4`, `Color`, `NodePath` |
| 引擎类型 | `Node`, `Sprite2D`, `Button`, `Camera3D`, `AnimationPlayer`, `HTTPRequest`, ... |
| 内置函数 | `print`, `str`, `range`, `load`, `preload`, `get_tree`, `get_node`, `typeof`, `lerp`, `clamp` |
| 注解 | `@export`, `@onready`, `@tool`, `@icon`, `@warning_ignore` |
| 注释 | 单行 `#`，多行 `#"""..."""#` |
| 字符串 | `"..."`, `'...'`, `$"..."`, `"""..."""`, `&"StringName"` |
| 节点路径 | `$Node/Path`, `%UniqueNode` |
| 数字 | `123`, `0.5`, `0xFF`, `0b1010`, `0o77` |

### GDShader (`.gdshader` / `.shader`)

| 元素 | 示例 |
|------|------|
| 关键字 | `shader_type`, `render_mode`, `uniform`, `varying`, `const`, `in`, `out` |
| 控制流 | `if`, `else`, `for`, `while`, `switch`, `return`, `discard` |
| 类型 | `float`, `int`, `vec2/3/4`, `mat2/3/4`, `sampler2D`, `bool` |
| 内置变量 | `VERTEX`, `ALBEDO`, `UV`, `COLOR`, `NORMAL`, `EMISSION`, `DIFFUSE_LIGHT`, ... |
| 内置函数 | `sin`, `cos`, `texture`, `normalize`, `dot`, `cross`, `mix`, `smoothstep`, ... |
| 注释 | 单行 `//`，块注释 `/* ... */` |

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🔗 相关项目

- [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) - 主侧边栏插件
- [DSH](https://github.com/deepseek-ai/deepseek-harness) - DeepSeek Harness
- [Godot Engine](https://godotengine.org/) - 游戏引擎

## 🙏 致谢

- 感谢 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 团队提供的优秀插件架构
- 感谢 Godot Engine 团队创建 GDScript 与 Godot Shading Language
- 感谢 CodeMirror 团队提供的代码编辑器框架
