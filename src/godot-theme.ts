/**
 * Godot Editor color theme for CodeMirror 6.
 *
 * Colors extracted from Godot 4.7 editor_settings-4.7.tres:
 *   text_editor/theme/highlighting/*
 */
import { tags } from '@lezer/highlight'
import { HighlightStyle } from '@codemirror/language'
import { EditorView } from '@codemirror/view'

// ── Godot 4.7 editor color palette ──────────────────────────────────
// Format: Color(r, g, b, a) from .tres → CSS hex/rgba

const godot = {
  // text_editor/theme/highlighting/*
  keyword:              '#FF7084',  // Color(1, 0.44, 0.52, 1)
  controlFlowKeyword:   '#FF8CCC',  // Color(1, 0.55, 0.8, 1)
  baseType:             '#42FFC2',  // Color(0.26, 1, 0.76, 1)
  engineType:           '#8FFFDB',  // Color(0.56, 1, 0.86, 1)
  userType:             '#C7FFF0',  // Color(0.78, 1, 0.93, 1)
  comment:              'rgba(255, 255, 255, 0.5)',   // Color(1, 1, 1, 0.5)
  docComment:           'rgba(153, 179, 204, 0.8)',   // Color(0.6, 0.7, 0.8, 0.8)
  string:               '#FFED9E',  // Color(1, 0.93, 0.63, 1)
  stringPlaceholder:    '#FFBF66',  // Color(1, 0.75, 0.4, 1)
  stringName:           '#FFC2A6',  // Color(1, 0.76, 0.65, 1)
  number:               '#A0FFE0',  // Color(0.63, 1, 0.88, 1)
  function:             '#57B3FF',  // Color(0.34, 0.7, 1, 1)
  functionDefinition:   '#66E6FF',  // Color(0.4, 0.9, 1, 1)  — gdscript/function_definition_color
  globalFunction:       '#A3A3F5',  // Color(0.64, 0.64, 0.96, 1) — gdscript/global_function_color
  memberVariable:       '#BDE1FF',  // Color(0.736, 0.88, 1, 1)
  symbol:               '#ABCAFF',  // Color(0.67, 0.79, 1, 1)
  annotation:           '#FFB373',  // Color(1, 0.7, 0.45, 1) — gdscript/annotation_color
  nodePath:             '#B8C47D',  // Color(0.72, 0.77, 0.49, 1) — gdscript/node_path_color
  nodeReference:        '#63C25A',  // Color(0.39, 0.76, 0.35, 1) — gdscript/node_reference_color
  text:                 'rgba(255, 255, 255, 0.75)',   // Color(1, 1, 1, 0.75)
  lineNumber:           'rgba(255, 255, 255, 0.5)',    // Color(1, 1, 1, 0.5)
  invalid:              '#FF776B',  // Color(1, 0.47, 0.42, 1) — breakpoint_color
  background:           '#1A1A1A',  // Color(0.103, 0.103, 0.103, 1)
  selection:            'rgba(86, 158, 255, 0.4)',     // Color(0.337, 0.62, 1, 0.4)
  currentLine:          'rgba(255, 255, 255, 0.07)',   // Color(1, 1, 1, 0.07)
  caret:                '#FFFFFF',   // Color(1, 1, 1, 1)
  bracketMismatch:      '#FF7866',   // Color(1, 0.47, 0.42, 1)
}

/**
 * HighlightStyle matching Godot 4.7's default dark theme.
 *
 * Token types produced by the GDScript / GDShader StreamLanguage parsers
 * are mapped here to concrete colors.  The tag names correspond to the
 * keys in each parser's `tokenTable` map.
 */
export const godotHighlightStyle = HighlightStyle.define([
  // ── Keywords ──────────────────────────────────────────────
  { tag: tags.keyword,                color: godot.keyword },
  { tag: tags.controlKeyword,        color: godot.controlFlowKeyword },
  { tag: tags.definitionKeyword,     color: godot.controlFlowKeyword },
  { tag: tags.moduleKeyword,         color: godot.keyword },
  { tag: tags.operatorKeyword,       color: godot.keyword },

  // ── Types ─────────────────────────────────────────────────
  { tag: tags.typeName,              color: godot.baseType },
  { tag: tags.className,             color: godot.engineType },
  { tag: tags.namespace,             color: godot.userType },

  // ── Definitions & references ──────────────────────────────
  { tag: tags.definition(tags.variableName),  color: godot.functionDefinition },
  { tag: tags.definition(tags.propertyName),  color: godot.functionDefinition },
  { tag: tags.variableName,                    color: godot.text },
  { tag: tags.propertyName,                    color: godot.memberVariable },
  { tag: tags.special(tags.variableName),     color: godot.globalFunction },

  // ── Functions ─────────────────────────────────────────────
  { tag: tags.function(tags.name),    color: godot.function },
  { tag: tags.function(tags.definition), color: godot.functionDefinition },

  // ── Literals & constants ──────────────────────────────────
  { tag: tags.atom,                   color: godot.number },
  { tag: tags.bool,                   color: godot.number },
  { tag: tags.null,                   color: godot.number },
  { tag: tags.number,                 color: godot.number },

  // ── Strings ───────────────────────────────────────────────
  { tag: tags.string,                 color: godot.string },
  { tag: tags.special(tags.string),  color: godot.stringPlaceholder },
  { tag: tags.regexp,                 color: godot.stringName },
  { tag: tags.escape,                 color: godot.stringPlaceholder },

  // ── Comments ──────────────────────────────────────────────
  { tag: tags.lineComment,           color: godot.comment, fontStyle: 'italic' },
  { tag: tags.blockComment,          color: godot.comment, fontStyle: 'italic' },
  { tag: tags.docComment,            color: godot.docComment, fontStyle: 'italic' },

  // ── Operators & punctuation ───────────────────────────────
  { tag: tags.operator,              color: godot.symbol },
  { tag: tags.punctuation,           color: godot.symbol },
  { tag: tags.derefOp,               color: godot.symbol },
  { tag: tags.operatorModifier,     color: godot.symbol },

  // ── Annotations / meta ────────────────────────────────────
  { tag: tags.annotation,            color: godot.annotation },
  { tag: tags.meta,                  color: godot.annotation },
  { tag: tags.macroName,             color: godot.annotation },
  { tag: tags.modifier,              color: godot.keyword },

  // ── Attributes ────────────────────────────────────────────
  { tag: tags.attributeName,         color: godot.annotation },
  { tag: tags.labelName,             color: godot.nodeReference },

  // ── Misc ──────────────────────────────────────────────────
  { tag: tags.self,                  color: godot.nodeReference },
  { tag: tags.invalid,               color: godot.invalid, textDecoration: 'underline wavy' },
])

/**
 * EditorView theme overrides to match Godot's dark editor appearance.
 */
export const godotEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: godot.background,
    color: godot.text,
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: godot.caret,
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: godot.selection,
  },
  '.cm-selectionBackground': {
    backgroundColor: godot.selection,
  },
  '.cm-activeLine': {
    backgroundColor: godot.currentLine,
  },
  '.cm-gutters': {
    backgroundColor: godot.background,
    color: godot.lineNumber,
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: godot.currentLine,
  },
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    outline: '1px solid rgba(255, 255, 255, 0.3)',
  },
  '.cm-nonmatchingBracket': {
    backgroundColor: godot.bracketMismatch,
    color: '#fff',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: godot.lineNumber,
  },
}, { dark: true })
