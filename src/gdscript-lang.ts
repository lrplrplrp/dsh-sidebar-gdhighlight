/**
 * GDScript language definition for CodeMirror 6
 *
 * Based on Godot 4.x GDScript syntax.
 * Uses StreamLanguage for simple token-based highlighting.
 */
import { type IndentContext, StreamLanguage, StringStream, type StreamParser } from '@codemirror/language'

/** GDScript token styles mapped to CodeMirror highlight classes */
const GdScriptStyles: Record<string, string> = {
  keyword: 'keyword',
  comment: 'comment',
  string: 'string',
  number: 'number',
  operator: 'operator',
  builtin: 'variableName.special',
  type: 'typeName',
  annotation: 'annotation',
  function: 'functionName',
  variable: 'variableName',
  property: 'propertyName',
  punctuation: 'punctuation',
  invalid: 'invalid',
}

// GDScript keywords
const KEYWORDS = new Set([
  'func', 'class', 'class_name', 'extends', 'var', 'const', 'static',
  'if', 'elif', 'else', 'for', 'while', 'match', 'match',
  'in', 'not', 'and', 'or', 'is', 'as',
  'signal', 'export', 'onready', 'tool',
  'return', 'break', 'continue', 'pass',
  'await', 'yield', // yield is Godot 3, await is Godot 4
  'super', 'self', 'void',
  'enum', 'struct',
  'preload', 'load',
  'true', 'false', 'null', 'PI', 'TAU', 'INF', 'NAN',
])

// GDScript types
const TYPES = new Set([
  'int', 'float', 'String', 'StringName', 'bool', 'void',
  'Array', 'Dictionary', 'PackedByteArray', 'PackedInt32Array',
  'PackedInt64Array', 'PackedFloat32Array', 'PackedFloat64Array',
  'PackedStringArray', 'PackedVector2Array', 'PackedVector3Array',
  'PackedVector4Array', 'PackedColorArray', 'PackedVariantArray',
  'Vector2', 'Vector2i', 'Vector3', 'Vector3i', 'Vector4', 'Vector4i',
  'Color', 'Rect2', 'Rect2i', 'Transform2D', 'Transform3D',
  'NodePath', 'RID', 'Callable', 'Signal',
  'Basis', 'Quaternion', 'AABB', 'Plane',
  'Node', 'Node2D', 'Node3D', 'Control', 'Resource',
  'Object', 'Variant',
])

// GDScript built-in functions
const BUILTINS = new Set([
  'print', 'printerr', 'printraw', 'prints', 'printt', 'print_rich',
  'str', 'str_to_var', 'var_to_str', 'var_to_bytes', 'bytes_to_var',
  'int', 'float', 'bool', 'typeof', 'type_exists',
  'range', 'lerp', 'lerp_angle', 'inverse_lerp', 'remap',
  'clamp', 'clampf', 'snapped', 'snappedf',
  'min', 'max', 'minf', 'maxf',
  'abs', 'absf', 'absi', 'sign', 'signf', 'signi',
  'pow', 'sqrt', 'log', 'exp',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
  'sinh', 'cosh', 'tanh',
  'deg_to_rad', 'rad_to_deg',
  'ord', 'char',
  'len', 'sizeof', 'typeof',
  'is_instance_of', 'is_instance_valid',
  'instantiate', 'new',
  'get_tree', 'get_node', 'get_node_or_null',
  'has_node', 'has_node_and_resource',
  'preload', 'load', 'export',
  'assert', 'debug_break', 'debug_get_stack_level_as_object',
  'yield', 'await',
  'connect', 'disconnect', 'emit_signal',
  'set', 'get', 'has_method', 'has_property', 'has_signal',
  'set_deferred', 'call_deferred',
  'is_a_parent_of', 'is_class',
  'get_class', 'get_incoming_connections',
  'get_indexed', 'set_indexed',
  'duplicate', 'duplicate_deep',
  'free', 'queue_free',
  'move_to_front', 'move_to_back',
  'show', 'hide', 'is_visible',
  'set_process', 'set_physics_process',
  'is_processing', 'is_physics_processing',
  'get_physics_process_delta_time', 'get_process_delta_time',
  'update_configuration_warnings',
  'request_ready',
  'is_inside_tree', 'is_inside_canvas',
  'get_viewport', 'get_window',
  'get_overlay', 'get_children',
  'get_parent', 'get_owner',
  'find_child', 'find_children',
  'has_child', 'has_children',
  'get_child', 'get_child_count',
  'remove_child', 'add_child',
  'reparent', 'replace_by',
  'set_owner', 'get_owner',
  'get_index', 'move_child',
  'get_path', 'get_path_to',
  'is_readable', 'is_writable',
  'is_processing_input', 'is_processing_unhandled_input',
  'is_processing_unhandled_key_input',
  'set_process_input', 'set_process_unhandled_input',
  'set_process_unhandled_key_input',
  'get_window', 'get_display_cutout',
  'get_visible_rect', 'get_screen_rect',
  'get_visible_characters', 'get_total_character_count',
  'get_line_count', 'get_line_width',
  'get_line_ascent', 'get_line_descent',
  'get_line_underline_position', 'get_line_underline_thickness',
  'is_pixel_aware', 'get_pixel_color',
  'is_approximately_equal', 'is_zero_approx',
  'is_equal_approx', 'is_finite', 'is_nan',
  'move_toward', 'move',
  'outside', 'encloses',
  'get_center', 'get_area', 'has_point',
  'intersection', 'merge', 'expand', 'grow', 'grow_individual',
  'abs', 'normalized', 'length', 'length_squared',
  'dot', 'cross', 'normalized', 'orthogonal',
  'lerp', 'slerp', 'cubic_interpolate',
  'slide', 'reflect', 'project',
  'angle', 'angle_to', 'angle_to_point',
  'distance_to', 'distance_squared_to',
  'is_equal_approx', 'is_zero_approx',
  'is_normalized', 'is_finite',
  'set_rotation', 'get_rotation', 'set_rotation_degrees', 'get_rotation_degrees',
  'set_rotation_snap', 'get_rotation_snap',
  'set_scale', 'get_scale',
  'set_global_position', 'get_global_position',
  'set_global_rotation', 'get_global_rotation',
  'set_global_scale', 'get_global_scale',
  'set_transform', 'get_transform',
  'set_global_transform', 'get_global_transform',
  'set_z_index', 'get_z_index',
  'set_z_as_relative_to_parent', 'is_z_relative_to_parent',
  'set_light_mask', 'get_light_mask',
  'set_visual_instance_layer_mask', 'get_visual_instance_layer_mask',
  'set_cast_shadows_setting', 'get_cast_shadows_setting',
  'set_gi_mode', 'get_gi_mode',
  'set_gi_lightmap_clip', 'get_gi_lightmap_clip',
  'set_gi_lightmap_scale', 'get_gi_lightmap_scale',
  'set_use_collision', 'is_using_collision',
  'set_collision_layer', 'get_collision_layer',
  'set_collision_mask', 'get_collision_mask',
  'set_collision_layer_value', 'get_collision_layer_value',
  'set_collision_mask_value', 'get_collision_mask_value',
  'set_collision_shape_one_way', 'is_collision_shape_one_way',
  'set_collision_shape_one_way_margin', 'get_collision_shape_one_way_margin',
  'set_pickable', 'is_pickable',
  'set_enable_area_pickup', 'is_area_pickup_enabled',
  'set_enable_monitoring', 'is_monitoring_enabled',
  'set_enable_monitorable', 'is_monitorable_enabled',
  'set_deferred', 'call_deferred',
  'set_indexed', 'get_indexed',
  'get_rid', 'get_instance_id',
  'get_tree', 'get_scene_tree',
  'get_singletons', 'get_autoloads',
  'get_root', 'get_current_scene',
  'get_node_count', 'get_nodes_in_group',
  'call_group', 'set_group',
  'notify_group', 'set_group_flags',
  'call_group_flags', 'notify_group_flags',
  'add_to_group', 'remove_from_group', 'is_in_group',
  'get_collision_layer_bit', 'get_collision_mask_bit',
  'set_collision_layer_bit', 'set_collision_mask_bit',
  'get_physics_layers_collision_layer_bit',
  'get_physics_layers_collision_mask_bit',
  'set_physics_layers_collision_layer_bit',
  'set_physics_layers_collision_mask_bit',
])

// GDScript annotations (decorators)
const ANNOTATIONS = new Set([
  'export', 'onready', 'tool', 'icon', 'class_name', 'extends',
  'master', 'puppet', 'remotesync', 'remote', 'puppetsync',
  'warning_ignore', 'deprecated',
])

interface GdScriptState {
  /** Current indentation level */
  indent: number
  /** Indentation stack for nested blocks */
  indentStack: number[]
  /** Whether we're in a string */
  inString: boolean
  /** String delimiter (' or """) */
  stringDelimiter: string
  /** Whether we're in a multi-line comment (#"""..."""#) */
  inMultilineComment: boolean
  /** Whether the previous line ended with a backslash (continuation) */
  continuation: boolean
}

const gdscriptDefinition: StreamParser<GdScriptState> = {
  startState(): GdScriptState {
    return {
      indent: 0,
      indentStack: [0],
      inString: false,
      stringDelimiter: '',
      inMultilineComment: false,
      continuation: false,
    }
  },

  token(stream: StringStream, state: GdScriptState): string | null {
    // Handle multi-line strings (""")
    if (state.inString) {
      if (stream.match(state.stringDelimiter)) {
        state.inString = false
        return GdScriptStyles.string
      }
      stream.next()
      return GdScriptStyles.string
    }

    // Handle multi-line comments (#"""..."""#)
    if (state.inMultilineComment) {
      if (stream.match(/#"""/)) {
        state.inMultilineComment = false
        return GdScriptStyles.comment
      }
      stream.next()
      return GdScriptStyles.comment
    }

    // Skip whitespace (but track indentation at line start)
    if (stream.eatSpace()) {
      return null
    }

    // Handle line continuation
    if (state.continuation) {
      state.continuation = false
    }

    // Line start - track indentation
    if (stream.sol()) {
      const indent = stream.indentation()
      // Update indentation stack
      while (state.indentStack.length > 1 && state.indentStack[state.indentStack.length - 1] > indent) {
        state.indentStack.pop()
      }
      state.indent = indent
    }

    // Single-line comment (#)
    if (stream.match(/^#.*/)) {
      // Check for multi-line comment start (#""")
      if (stream.match(/#"""#/)) {
        // This is a single-line multi-line comment (#"""#)
        return GdScriptStyles.comment
      }
      if (stream.current().startsWith('#"""')) {
        state.inMultilineComment = true
        return GdScriptStyles.comment
      }
      return GdScriptStyles.comment
    }

    // Multi-line string (""")
    if (stream.match('"""')) {
      state.inString = true
      state.stringDelimiter = '"""'
      return GdScriptStyles.string
    }

    // String (single or double quoted)
    if (stream.match(/^"([^"\\]|\\.)*"/) || stream.match(/^'([^'\\]|\\.)*'/)) {
      return GdScriptStyles.string
    }

    // String interpolation $"..." or $"..." (Godot 4)
    if (stream.match(/^\$"[^"]*"/) || stream.match(/^\$'[^']*'/)) {
      return GdScriptStyles.string
    }

    // Number (integer, float, hex, binary, octal)
    if (stream.match(/^-?0x[0-9a-fA-F_]+/)) {
      return GdScriptStyles.number
    }
    if (stream.match(/^-?0b[01_]+/)) {
      return GdScriptStyles.number
    }
    if (stream.match(/^-?0o[0-7_]+/)) {
      return GdScriptStyles.number
    }
    if (stream.match(/^-?[0-9][0-9_]*\.[0-9][0-9_]*([eE][+-]?[0-9]+)?/)) {
      return GdScriptStyles.number
    }
    if (stream.match(/^-?[0-9][0-9_]*[eE][+-]?[0-9]+/)) {
      return GdScriptStyles.number
    }
    if (stream.match(/^-?[0-9][0-9_]*/)) {
      return GdScriptStyles.number
    }

    // Annotation (@export, @onready, etc.)
    if (stream.match(/^@[a-zA-Z_]\w*/)) {
      const word = stream.current().slice(1)
      if (ANNOTATIONS.has(word)) {
        return GdScriptStyles.annotation
      }
      return GdScriptStyles.annotation
    }

    // Operators
    if (stream.match(/^(\+=|-=|\*=|\/=|%=|&=|\|=|\^=|<<=|>>=|\*\*=|:=|==|!=|>=|<=|=>|->|\.\.|<<|>>|&&|\|\||\+\+|--|[+\-*/%&|^~!<>=])/)) {
      return GdScriptStyles.operator
    }

    // Punctuation
    if (stream.match(/^[\(\)\[\]\{\}:@;,\.]/)) {
      return GdScriptStyles.punctuation
    }

    // Arrow (->) for return type
    if (stream.match('->')) {
      return GdScriptStyles.operator
    }

    // Dot operator (.)
    if (stream.match('.')) {
      return GdScriptStyles.operator
    }

    // Identifiers and keywords
    if (stream.match(/^[a-zA-Z_]\w*/)) {
      const word = stream.current()

      if (KEYWORDS.has(word)) {
        return GdScriptStyles.keyword
      }

      if (TYPES.has(word)) {
        return GdScriptStyles.type
      }

      if (BUILTINS.has(word)) {
        return GdScriptStyles.builtin
      }

      // Check if it's a function call (followed by '(')
      if (stream.peek() === '(') {
        return GdScriptStyles.function
      }

      // Check if it's a type annotation (followed by ':')
      if (stream.peek() === ':') {
        return GdScriptStyles.type
      }

      return GdScriptStyles.variable
    }

    // If nothing matched, advance
    stream.next()
    return null
  },

  indent(state: GdScriptState, textAfter: string, context: IndentContext): number {
    // Simple indentation: increase after ':', decrease after dedent keywords
    const indentUnit = 4

    if (textAfter.match(/^\s*(func|class|if|elif|else|for|while|match|enum|struct|try|except|finally)/)) {
      return state.indent + indentUnit
    }

    if (textAfter.match(/^\s*(elif|else|except|finally|catch)/)) {
      return state.indent
    }

    return state.indent
  },

  languageData: {
    commentTokens: { line: '#' },
    blockCommentStart: '#"""',
    blockCommentEnd: '"""#',
    closeBrackets: { strings: true },
  },
}

/**
 * GDScript language support for CodeMirror 6
 */
export function gdscript() {
  return StreamLanguage.define(gdscriptDefinition)
}

/**
 * File extensions that should use GDScript highlighting
 */
export const GDSCRIPT_EXTENSIONS = ['gd']

/**
 * Check if a file path should use GDScript highlighting
 */
export function isGdScript(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase()
  return ext === 'gd'
}

export default gdscript
