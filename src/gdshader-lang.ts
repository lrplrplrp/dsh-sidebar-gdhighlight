/**
 * Godot Shading Language (GDShader / .gdshader) definition for CodeMirror 6
 *
 * Based on Godot 4.x shader language (GLSL-like with Godot-specific extensions).
 * Supports: shader_type, render_mode, uniforms, varyings, built-in variables,
 * vertex/fragment/light processors, and standard GLSL + Godot math functions.
 */
import { StreamLanguage, StringStream, type StreamParser } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

// ── GDShader keywords ──────────────────────────────────────────────────
const KEYWORDS = new Set([
  'shader_type', 'render_mode',
  'uniform', 'varying', 'const', 'in', 'out', 'attribute',
  'struct', 'void',
])

const CONTROL_KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'return', 'discard',
])

const CONSTANTS = new Set([
  'true', 'false',
])

// ── GDShader types ─────────────────────────────────────────────────────
const TYPES = new Set([
  // Scalars
  'float', 'int', 'uint', 'bool',
  // Vectors
  'vec2', 'vec3', 'vec4',
  'ivec2', 'ivec3', 'ivec4',
  'uvec2', 'uvec3', 'uvec4',
  'bvec2', 'bvec3', 'bvec4',
  // Matrices
  'mat2', 'mat3', 'mat4',
  // Samplers
  'sampler2D', 'sampler3D', 'samplerCube',
  'isampler2D', 'isampler3D', 'isamplerCube',
  'usampler2D', 'usampler3D', 'usamplerCube',
  'sampler2DArray', 'isampler2DArray', 'usampler2DArray',
  'samplerExternalOES',
])

// ── GDShader built-in functions ────────────────────────────────────────
const BUILTINS = new Set([
  // Trigonometry
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'radians', 'degrees',
  // Exponential
  'pow', 'exp', 'log', 'exp2', 'log2', 'sqrt', 'inversesqrt',
  // Common
  'abs', 'sign', 'floor', 'ceil', 'round', 'trunc', 'fract',
  'mod', 'fmod', 'min', 'max', 'clamp',
  'mix', 'step', 'smoothstep', 'lerp',
  // Geometry
  'length', 'distance', 'dot', 'cross', 'normalize',
  'faceforward', 'reflect', 'refract',
  // Matrix
  'matrixCompMult', 'outerProduct', 'transpose', 'determinant', 'inverse',
  // Vector relational
  'lessThan', 'lessThanEqual', 'greaterThan', 'greaterThanEqual',
  'equal', 'notEqual', 'any', 'all', 'not',
  // Texture
  'texture', 'textureLod', 'textureProj', 'textureGrad', 'textureSize',
  'textureFetch', 'texelFetch',
  // Godot-specific
  'screenToWorld', 'worldToScreen',
  'hint_color', 'hint_range', 'source_color',
])

// ── GDShader built-in variables (context-sensitive) ────────────────────
// These are uppercase by convention; they're recognized when in ALL_CAPS
const BUILTIN_VARS = new Set([
  // Spatial vertex
  'VERTEX', 'NORMAL', 'TANGENT', 'BINORMAL',
  'UV', 'UV2', 'COLOR',
  'MODELVIEW_MATRIX', 'MODEL_MATRIX', 'VIEW_MATRIX', 'PROJECTION_MATRIX',
  'INV_VIEW_MATRIX', 'INV_PROJECTION_MATRIX',
  'INSTANCE', 'INSTANCE_ID', 'INSTANCE_CUSTOM',
  'NODE_POSITION_WORLD', 'NODE_POSITION_VIEW',
  'CAMERA_POSITION_WORLD', 'CAMERA_DIRECTION_WORLD', 'CAMERA_VISIBLE_WORLD',
  'NODE_POSITION_WORLD',
  'PI', 'TAU', 'PROCESSED_TIME', 'TIME',
  // Spatial fragment
  'ALBEDO', 'ALPHA', 'METALLIC', 'ROUGHNESS', 'SPECULAR',
  'EMISSION', 'AO', 'AO_LIGHT_AFFECT',
  'RIM', 'RIM_TINT', 'CLOTH', 'CLEARCOAT', 'CLEARCOAT_ROUGHNESS',
  'ANISOTROPY', 'ANISOTROPY_FLOW',
  'NORMAL_MAP', 'NORMAL_MAP_DEPTH',
  'SCREEN_UV', 'SCREEN_TEXTURE', 'DEPTH_TEXTURE',
  'FOG', 'FOG_ALBEDO', 'FOG_DENSITY', 'FOG_AERIAL_PERSPECTIVE',
  'FRESNEL',
  'SSS_STRENGTH', 'SSS_TRANSMITTANCE_COLOR',
  'BACKLIGHT',
  // Spatial light
  'DIFFUSE_LIGHT', 'SPECULAR_LIGHT',
  'LIGHT', 'LIGHT_COLOR', 'ATTENUATION', 'VIEW',
  // Canvas item
  'VERTEX', 'UV', 'COLOR', 'MODULATE',
  'TEXTURE', 'TEXTURE_PIXEL_SIZE',
  'POINT_SIZE', 'POINT_COORD',
  'SCREEN_UV', 'SCREEN_TEXTURE',
])

// ── Shader processor keywords ──────────────────────────────────────────
const PROCESSOR_KEYWORDS = new Set([
  'vertex', 'fragment', 'light',
])

// ── Parser state ───────────────────────────────────────────────────────
interface ShaderState {
  /** Whether inside a block comment */
  inBlockComment: boolean
  /** Whether inside a string */
  inString: boolean
}

const gdshaderDefinition: StreamParser<ShaderState> = {
  startState(): ShaderState {
    return {
      inBlockComment: false,
      inString: false,
    }
  },

  token(stream: StringStream, state: ShaderState): string | null {
    // ── Inside block comment ─────────────────────────────────
    if (state.inBlockComment) {
      if (stream.match('*/')) {
        state.inBlockComment = false
        return 'comment'
      }
      stream.next()
      return 'comment'
    }

    // ── Skip whitespace ──────────────────────────────────────
    if (stream.eatSpace()) return null

    // ── Block comment (/* ... */) ────────────────────────────
    if (stream.match('/*')) {
      state.inBlockComment = true
      return 'comment'
    }

    // ── Line comment (//) ────────────────────────────────────
    if (stream.match('//')) {
      stream.skipToEnd()
      return 'comment'
    }

    // ── String ───────────────────────────────────────────────
    if (stream.match(/^"(?:[^"\\]|\\.)*"/) || stream.match(/^'(?:[^'\\]|\\.)*'/)) {
      return 'string'
    }

    // ── Numbers (hex, binary, octal, float, int) ─────────────
    if (stream.match(/^-?0x[0-9a-fA-F]+/)) return 'number'
    if (stream.match(/^-?0b[01]+/)) return 'number'
    if (stream.match(/^-?0o[0-7]+/)) return 'number'
    if (stream.match(/^-?[0-9][0-9]*\.[0-9][0-9]*([eE][+-]?[0-9]+)?[f]?/)) return 'number'
    if (stream.match(/^-?[0-9][0-9]*[eE][+-]?[0-9]+[f]?/)) return 'number'
    if (stream.match(/^-?[0-9][0-9]*[f]?/)) return 'number'

    // ── Operators ────────────────────────────────────────────
    if (stream.match(/^(\+\+|--|<<|>>|<=|>=|==|!=|&&|\|\||[+\-*/%&|^~!<>=])/)) {
      return 'operator'
    }

    // ── Punctuation ──────────────────────────────────────────
    if (stream.match(/^[\(\)\[\]\{\};:,\.\[\]]/)) {
      return 'punctuation'
    }

    // ── Identifiers / keywords / types / builtins ────────────
    if (stream.match(/^[a-zA-Z_]\w*/)) {
      const word = stream.current()

      // Control flow
      if (CONTROL_KEYWORDS.has(word)) return 'controlKeyword'

      // Shader-specific keywords
      if (KEYWORDS.has(word)) return 'keyword'

      // Constants
      if (CONSTANTS.has(word)) return 'atom'

      // Types
      if (TYPES.has(word)) return 'typeName'

      // Built-in functions
      if (BUILTINS.has(word)) return 'builtin'

      // Processor functions (vertex, fragment, light)
      if (PROCESSOR_KEYWORDS.has(word)) return 'keyword'

      // ALL_CAPS built-in variables
      if (BUILTIN_VARS.has(word) || /^[A-Z][A-Z0-9_]+$/.test(word)) {
        return 'variableName'
      }

      // Followed by '(' → function call
      if (stream.peek() === '(') {
        return 'function'
      }

      return 'variableName'
    }

    // ── Unknown: advance one character ────────────────────────
    stream.next()
    return null
  },

  languageData: {
    commentTokens: { line: '//', block: { open: '/*', close: '*/' } },
    closeBrackets: { strings: true },
  },

  // ── Custom token → tag mapping ────────────────────────────
  tokenTable: {
    keyword:          t.keyword,
    controlKeyword:   t.controlKeyword,
    typeName:         t.typeName,
    className:        t.className,
    builtin:          t.special(t.variableName),
    variableName:     t.variableName,
    function:         t.function(t.name),
    atom:             t.atom,
    string:           t.string,
    number:           t.number,
    operator:         t.operator,
    punctuation:      t.punctuation,
    comment:          t.lineComment,
    invalid:          t.invalid,
  },
}

/**
 * GDShader language support for CodeMirror 6
 */
export function gdshader() {
  return StreamLanguage.define(gdshaderDefinition)
}

/** File extensions that should use GDShader highlighting */
export const GDSHADER_EXTENSIONS = ['gdshader', 'shader']

/** Check if a file path should use GDShader highlighting */
export function isGdShader(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase()
  return ext === 'gdshader' || ext === 'shader'
}

export default gdshader
