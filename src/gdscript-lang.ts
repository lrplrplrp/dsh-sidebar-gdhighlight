/**
 * GDScript language definition for CodeMirror 6
 *
 * Based on Godot 4.x GDScript syntax with comprehensive token coverage:
 *   - Keywords, control flow, definitions (func/class/var/const/signal/enum)
 *   - Base types, engine types, user types
 *   - Built-in functions, node paths, string names
 *   - Annotations, comments (single-line + multi-line doc comments)
 *   - Strings (basic, multi-line, interpolation), numbers (hex/bin/oct/float)
 *   - Operators, punctuation
 */
import { type IndentContext, StreamLanguage, StringStream, type StreamParser } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// ── Token type names (mapped via tokenTable → @lezer/highlight Tags) ──

// ── GDScript keywords ──────────────────────────────────────────────────
const KEYWORDS = new Set([
  // Declarations
  'func', 'class', 'class_name', 'extends', 'var', 'const', 'static',
  'signal', 'enum', 'preload', 'load', 'export',
  // Imports
  'as',
  // OOP
  'super', 'self',
  // Godot 4.x keywords
  'await', 'void',
])

const CONTROL_KEYWORDS = new Set([
  'if', 'elif', 'else', 'for', 'while', 'match', 'in',
  'return', 'break', 'continue', 'pass',
  'not', 'and', 'or', 'is',
])

// ── GDScript types ─────────────────────────────────────────────────────
// Base types (shown in base_type_color in Godot)
const BASE_TYPES = new Set([
  'int', 'float', 'String', 'StringName', 'bool',
  'Array', 'Dictionary',
  'PackedByteArray', 'PackedInt32Array', 'PackedInt64Array',
  'PackedFloat32Array', 'PackedFloat64Array',
  'PackedStringArray', 'PackedVector2Array', 'PackedVector3Array',
  'PackedVector4Array', 'PackedColorArray', 'PackedVariantArray',
  'Vector2', 'Vector2i', 'Vector3', 'Vector3i', 'Vector4', 'Vector4i',
  'Color', 'Rect2', 'Rect2i', 'Transform2D', 'Transform3D',
  'NodePath', 'RID', 'Callable', 'Signal',
  'Basis', 'Quaternion', 'AABB', 'Plane', 'Projection',
  'Variant',
])

// Engine types (shown in engine_type_color)
const ENGINE_TYPES = new Set([
  'Node', 'Node2D', 'Node3D', 'Control', 'Resource', 'Object',
  'Area2D', 'Area3D', 'RigidBody2D', 'RigidBody3D',
  'StaticBody2D', 'StaticBody3D', 'CharacterBody2D', 'CharacterBody3D',
  'CollisionShape2D', 'CollisionShape3D', 'CollisionPolygon2D', 'CollisionPolygon3D',
  'Sprite2D', 'Sprite3D', 'AnimatedSprite2D', 'AnimatedSprite3D',
  'Camera2D', 'Camera3D',
  'Light2D', 'DirectionalLight3D', 'OmniLight3D', 'SpotLight3D',
  'AudioStreamPlayer', 'AudioStreamPlayer2D', 'AudioStreamPlayer3D',
  'AnimationPlayer', 'AnimationTree', 'AnimationMixer',
  'TileMap', 'TileMapLayer', 'ParallaxBackground', 'ParallaxLayer',
  'CanvasLayer', 'CanvasGroup', 'SubViewportContainer', 'SubViewport',
  'Timer', 'ResourceLoader', 'SceneTree', 'Engine',
  'PackedScene', 'PackedStringArray', 'Image', 'Texture2D',
  'Button', 'Label', 'LineEdit', 'TextEdit', 'RichTextLabel',
  'Panel', 'MarginContainer', 'HBoxContainer', 'VBoxContainer',
  'ScrollContainer', 'GridContainer', 'TabContainer',
  'FileDialog', 'Popup', 'Window',
  'HTTPRequest', 'WebSocketPeer', 'MultiplayerPeer',
  'Path2D', 'Path3D', 'PathFollow2D', 'PathFollow3D',
  'NavigationAgent2D', 'NavigationAgent3D',
  'GPUParticles2D', 'GPUParticles3D', 'CPUParticles2D', 'CPUParticles3D',
  'Tween', 'StreamPeerTCP', 'PacketPeerUDP',
  'Json', 'XMLParser', 'ConfigFile',
  'FileAccess', 'DirAccess', 'ZipReader',
])

// ── Built-in functions ─────────────────────────────────────────────────
const BUILTINS = new Set([
  // Type conversion
  'str', 'str_to_var', 'var_to_str', 'var_to_bytes', 'bytes_to_var',
  'int', 'float', 'bool', 'typeof', 'type_exists',
  // Math
  'range', 'lerp', 'lerp_angle', 'inverse_lerp', 'remap',
  'clamp', 'clampf', 'snapped', 'snappedf',
  'min', 'max', 'minf', 'maxf',
  'abs', 'absf', 'absi', 'sign', 'signf', 'signi',
  'pow', 'sqrt', 'log', 'exp',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
  'sinh', 'cosh', 'tanh',
  'deg_to_rad', 'rad_to_deg',
  'ord', 'char',
  'roundi', 'roundf', 'floori', 'floorf', 'ceili', 'ceilif', 'stepify',
  // Utility
  'print', 'printerr', 'printraw', 'prints', 'printt', 'print_rich',
  'len', 'sizeof', 'typeof',
  'is_instance_of', 'is_instance_valid',
  'instantiate', 'new',
  'assert', 'debug_break', 'debug_get_stack_level_as_object',
  // Node / tree
  'get_tree', 'get_node', 'get_node_or_null',
  'has_node', 'has_node_and_resource',
  'get_viewport', 'get_window',
  'get_overlay', 'get_children', 'get_child', 'get_child_count',
  'get_parent', 'get_owner',
  'find_child', 'find_children',
  'has_child', 'has_children',
  'remove_child', 'add_child',
  'reparent', 'replace_by',
  'set_owner', 'get_owner',
  'get_index', 'move_child',
  'get_path', 'get_path_to',
  // Signals
  'connect', 'disconnect', 'emit_signal',
  'set', 'get', 'has_method', 'has_property', 'has_signal',
  'set_deferred', 'call_deferred',
  // Scene
  'duplicate', 'duplicate_deep',
  'free', 'queue_free',
  'move_to_front', 'move_to_back',
  'show', 'hide', 'is_visible',
  'set_process', 'set_physics_process',
  'is_processing', 'is_physics_processing',
  'get_physics_process_delta_time', 'get_process_delta_time',
  // Collision
  'set_collision_layer', 'get_collision_layer',
  'set_collision_mask', 'get_collision_mask',
  // Math helpers (vectors, etc.)
  'is_equal_approx', 'is_zero_approx', 'is_finite', 'is_nan',
  'move_toward', 'normalized', 'length', 'length_squared',
  'dot', 'cross', 'angle', 'angle_to',
  'distance_to', 'distance_squared_to',
  // Color / rendering
  'get_pixel_color',
  // Group
  'get_nodes_in_group', 'add_to_group', 'remove_from_group', 'is_in_group',
  'call_group', 'set_group', 'notify_group',
  // Resource
  'get_rid', 'get_instance_id',
  'preloads',
])

// ── Godot constants ────────────────────────────────────────────────────
const CONSTANTS = new Set([
  'true', 'false', 'null', 'PI', 'TAU', 'INF', 'NAN',
  'KEY_*', 'JOY_*', 'MOUSE_*', 'BUTTON_*',
  'OK', 'FAILED', 'ERR_*',
  'UP', 'DOWN', 'LEFT', 'RIGHT',
  'HALF_PI', 'TAU',
])

// ── GDScript annotations ───────────────────────────────────────────────
const ANNOTATIONS = new Set([
  'export', 'onready', 'tool', 'icon', 'class_name', 'extends',
  'warning_ignore', 'deprecated',
  'master', 'puppet', 'remotesync', 'remote', 'puppetsync',
])

// ── Parser state ───────────────────────────────────────────────────────
interface GdScriptState {
  /** Current indentation level */
  indent: number
  /** Indentation stack for nested blocks */
  indentStack: number[]
  /** Whether we're in a string (triple-quoted or $-interpolated) */
  inString: boolean
  /** String delimiter ('"""') */
  stringDelimiter: string
  /** Whether we're in a multi-line comment (#"""..."""#) */
  inMultilineComment: boolean
  /** Whether inside ${} interpolation inside a $"..." string */
  inInterpolation: boolean
  /** Nesting depth of interpolation braces */
  interpolationDepth: number
}

const gdscriptDefinition: StreamParser<GdScriptState> = {
  startState(): GdScriptState {
    return {
      indent: 0,
      indentStack: [0],
      inString: false,
      stringDelimiter: '',
      inMultilineComment: false,
      inInterpolation: false,
      interpolationDepth: 0,
    }
  },

  token(stream: StringStream, state: GdScriptState): string | null {
    // ── Inside multi-line string ─────────────────────────────
    if (state.inString) {
      if (state.inInterpolation) {
        // Handle ${} inside strings
        if (stream.match('}')) {
          state.interpolationDepth--
          if (state.interpolationDepth <= 0) {
            state.inInterpolation = false
            state.interpolationDepth = 0
          }
          return 'punctuation'
        }
        // Inside interpolation: parse as normal GDScript
        if (stream.match('{')) {
          state.interpolationDepth++
          return 'punctuation'
        }
        // Try to match tokens inside interpolation
        if (stream.match(/^"[^"]*"/) || stream.match(/^'[^']*'/)) return 'string'
        if (stream.match(/^-?0x[0-9a-fA-F_]+/)) return 'number'
        if (stream.match(/^-?[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9]+)?/)) return 'number'
        if (stream.match(/^[a-zA-Z_]\w*/)) {
          const word = stream.current()
          if (KEYWORDS.has(word) || CONTROL_KEYWORDS.has(word)) return 'keyword'
          if (word === 'self') return 'self'
          return 'variable'
        }
        if (stream.match(/^[+\-*/%&|^~!<>=:]/)) return 'operator'
        stream.next()
        return 'string'
      }
      // End of multi-line string
      if (stream.match(state.stringDelimiter)) {
        state.inString = false
        return 'string'
      }
      // Interpolation start
      if (stream.match('${')) {
        state.inInterpolation = true
        state.interpolationDepth = 1
        return 'string'
      }
      stream.next()
      return 'string'
    }

    // ── Inside multi-line comment ────────────────────────────
    if (state.inMultilineComment) {
      if (stream.match(/#"""/) || stream.match(/"""#/)) {
        state.inMultilineComment = false
        return 'comment'
      }
      stream.next()
      return 'comment'
    }

    // ── Skip whitespace ──────────────────────────────────────
    if (stream.eatSpace()) return null

    // ── Line start: track indentation ────────────────────────
    if (stream.sol()) {
      const indent = stream.indentation()
      while (state.indentStack.length > 1 && state.indentStack[state.indentStack.length - 1] > indent) {
        state.indentStack.pop()
      }
      state.indent = indent
    }

    // ── Single-line comment (#) ──────────────────────────────
    if (stream.match('#')) {
      // Check for doc-comment / multi-line comment start (#""" )
      if (stream.match('"""')) {
        state.inMultilineComment = true
        return 'comment'
      }
      stream.skipToEnd()
      return 'comment'
    }

    // ── Node paths ($NodePath, %UniqueNode) ──────────────────
    if (stream.match(/^\$["']/) || stream.match(/^%["']/)) {
      const quote = stream.current().slice(-1)
      if (stream.match(new RegExp(`^[^${quote}\\\\]*[${quote}]`))) {
        return 'string'
      }
      stream.skipToEnd()
      return 'string'
    }
    if (stream.match(/^\$[A-Za-z_\/][\w\/]*/)) {
      return 'string' // node path
    }
    if (stream.match(/^%[A-Za-z_]\w*/)) {
      return 'string' // unique node name
    }

    // ── String name literals (&"..." / &"...") ───────────────
    if (stream.match(/^&["']/)) {
      const quote = stream.current().slice(-1)
      if (stream.match(new RegExp(`^[^${quote}\\\\]*[${quote}]`))) {
        return 'string'
      }
      stream.skipToEnd()
      return 'string'
    }

    // ── Multi-line string (""") ──────────────────────────────
    if (stream.match('"""')) {
      state.inString = true
      state.stringDelimiter = '"""'
      return 'string'
    }

    // ── String interpolation $"..." ──────────────────────────
    if (stream.match(/^\$"/)) {
      // Interpolated string
      state.inString = true
      state.stringDelimiter = '"'
      state.inInterpolation = false
      state.interpolationDepth = 0
      return 'string'
    }
    if (stream.match(/^\$'/)) {
      state.inString = true
      state.stringDelimiter = "'"
      state.inInterpolation = false
      state.interpolationDepth = 0
      return 'string'
    }

    // ── Regular string ───────────────────────────────────────
    if (stream.match(/^"(?:[^"\\]|\\.)*"/) || stream.match(/^'(?:[^'\\]|\\.)*'/)) {
      return 'string'
    }

    // ── Numbers ──────────────────────────────────────────────
    if (stream.match(/^-?0x[0-9a-fA-F_]+/)) return 'number'
    if (stream.match(/^-?0b[01_]+/)) return 'number'
    if (stream.match(/^-?0o[0-7_]+/)) return 'number'
    if (stream.match(/^-?[0-9][0-9_]*\.[0-9][0-9_]*([eE][+-]?[0-9]+)?/)) return 'number'
    if (stream.match(/^-?[0-9][0-9_]*[eE][+-]?[0-9]+/)) return 'number'
    if (stream.match(/^-?[0-9][0-9_]*/)) return 'number'

    // ── Annotations (@export, @onready, etc.) ────────────────
    if (stream.match(/^@[a-zA-Z_]\w*/)) {
      const word = stream.current().slice(1)
      return ANNOTATIONS.has(word) ? 'annotation' : 'annotation'
    }

    // ── Operators ────────────────────────────────────────────
    if (stream.match(/^(\+=|-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|\*\*=|:=|==|!=|>=|<=|=>|\.\.|<<|>>|&&|\|\||\+\+|--|[+\-*/%&|^~!<>=])/)) {
      return 'operator'
    }

    // ── Punctuation ──────────────────────────────────────────
    if (stream.match(/^[\(\)\[\]\{\}:@;,\.]/)) {
      return 'punctuation'
    }

    // ── Identifiers / keywords / types / builtins ────────────
    if (stream.match(/^[a-zA-Z_]\w*/)) {
      const word = stream.current()

      // Control flow keywords (distinct color in Godot)
      if (CONTROL_KEYWORDS.has(word)) return 'controlKeyword'

      // Declaration keywords
      if (KEYWORDS.has(word)) return 'keyword'

      // Godot constants (true, false, null, PI, ...)
      if (CONSTANTS.has(word)) return 'atom'

      // Base types (int, float, String, Vector2, ...)
      if (BASE_TYPES.has(word)) return 'typeName'

      // Engine types (Node, Sprite2D, Button, ...)
      if (ENGINE_TYPES.has(word)) return 'className'

      // Built-in functions (print, get_tree, ...)
      if (BUILTINS.has(word)) return 'builtin'

      // self keyword
      if (word === 'self') return 'self'

      // Check if followed by '(' → function call
      if (stream.peek() === '(') {
        // Match, then return as variable (we'll highlight via tags)
        return 'function'
      }

      // Check if followed by ':' → type annotation
      // (handled as regular variable; the : is punctuation)

      return 'variableName'
    }

    // ── If nothing matched, advance one character ─────────────
    stream.next()
    return null
  },

  indent(state: GdScriptState, textAfter: string, context: IndentContext): number {
    const indentUnit = 4

    // Increase indent after block-starting tokens
    if (textAfter.match(/^\s*(func |class |if |elif |else|for |while |match |enum |struct )/)) {
      return state.indent + indentUnit
    }

    // Decrease indent for dedent keywords
    if (textAfter.match(/^\s*(elif |else|except |finally )/)) {
      return state.indent
    }

    return state.indent
  },

  languageData: {
    commentTokens: { line: '#', block: { open: '#"""', close: '"""#' } },
    closeBrackets: { strings: true },
  },

  // ── Custom token → tag mapping ────────────────────────────
  // Maps the strings returned by token() to @lezer/highlight Tags.
  tokenTable: {
    keyword:          t.keyword,
    controlKeyword:   t.controlKeyword,
    typeName:         t.typeName,
    className:        t.className,
    builtin:          t.special(t.variableName),
    annotation:       t.annotation,
    variableName:     t.variableName,
    function:         t.function(t.name),
    self:             t.self,
    atom:             t.atom,
    string:           t.string,
    number:           t.number,
    operator:         t.operator,
    punctuation:      t.punctuation,
    comment:          t.lineComment,
    invalid:          t.invalid,
    property:         t.propertyName,
  },
}

/**
 * GDScript language support for CodeMirror 6
 */
export function gdscript() {
  return StreamLanguage.define(gdscriptDefinition)
}

/** File extensions that should use GDScript highlighting
 *  ('.inc' files are Godot include files containing GDScript code) */
export const GDSCRIPT_EXTENSIONS = ['gd', 'inc']

/** Check if a file path should use GDScript highlighting */
export function isGdScript(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase()
  return ext === 'gd' || ext === 'inc'
}

export default gdscript
