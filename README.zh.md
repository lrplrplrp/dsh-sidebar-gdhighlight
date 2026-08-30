# dsh-sidebar-gdhighlight

简体中文 | [English](README.md)

DSH 插件：为 [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 提供 GDScript 语法高亮支持。

[![npm version](https://img.shields.io/npm/v/dsh-sidebar-gdhighlight)](https://www.npmjs.com/package/dsh-sidebar-gdhighlight)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 功能特性

- 完整的 GDScript 4.x 语法高亮
- CodeMirror 6 集成，支持 dsh-better-sidebar
- 支持所有 GDScript 关键字、类型、内置函数和注解
- 支持多行字符串（`"""`）、注释（`#`）和字符串插值（`$""`）
- 针对 Godot 特定功能的自定义语法着色

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

| 元素 | 示例 |
|------|------|
| 关键字 | `func`, `class`, `extends`, `var`, `const`, `if/elif/else`, `for/while`, `match`, `signal`, `export`, `onready`, `await` |
| 类型 | `int`, `float`, `String`, `bool`, `Array`, `Dictionary`, `Vector2/3/4`, `Color`, `Node`, `Resource` |
| 内置函数 | `print`, `str`, `range`, `load`, `preload`, `get_tree`, `get_node`, `typeof`, `lerp`, `clamp` |
| 注解 | `@export`, `@onready`, `@tool`, `@icon` |
| 注释 | 单行 `#`，多行 `#"""..."""#` |
| 字符串 | `"..."`, `'...'`, `$"..."`, `"""..."""` |
| 数字 | `123`, `0.5`, `0xFF`, `0b1010`, `0o77` |

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
- 感谢 Godot Engine 团队创建 GDScript
- 感谢 CodeMirror 团队提供的代码编辑器
