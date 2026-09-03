/**
 * dsh-sidebar-gdhighlight — client (browser) side.
 *
 * DSH plugin that adds GDScript & GDShader syntax highlighting to
 * dsh-better-sidebar, using Godot 4.7 editor colors.
 *
 * The `betterSidebar` service is provided by dsh-better-sidebar's client
 * bundle, so this registration must run in the browser (see the `./client`
 * export in package.json).
 */
import { useEffect, useRef } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { FileViewerProps } from 'dsh-better-sidebar'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers, keymap } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting } from '@codemirror/language'
import { godotHighlightStyle, godotEditorTheme } from './godot-theme.js'
import { gdscript } from './gdscript-lang.js'
import { gdshader } from './gdshader-lang.js'

export const name = 'dsh-sidebar-gdhighlight'

export const inject = ['betterSidebar']

// ── Shared CodeMirror extensions for both GDScript & GDShader ──────────
const baseExtensions = [
  EditorView.lineWrapping,
  lineNumbers(),
  history(),
  EditorState.tabSize.of(4),
  EditorView.contentAttributes.of({ spellcheck: 'false' }),
  syntaxHighlighting(godotHighlightStyle),
  godotEditorTheme,
  keymap.of([...defaultKeymap, ...historyKeymap]),
]

// ── Reusable CodeMirror editor component ────────────────────────────────
function CodeEditor({ content, path, lang }: FileViewerProps & { lang: () => any }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!content || !hostRef.current) return

    // Destroy previous view
    if (viewRef.current) {
      viewRef.current.destroy()
      viewRef.current = null
    }

    const state = EditorState.create({
      doc: content,
      extensions: [
        ...baseExtensions,
        lang(), // gdscript() or gdshader()
      ],
    })

    const view = new EditorView({
      state,
      parent: hostRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [content, path])

  return (
    <div
      ref={hostRef}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '14px',
        lineHeight: '1.5',
      }}
    />
  )
}

// ── GDScript editor ─────────────────────────────────────────────────────
function GdScriptEditor(props: FileViewerProps) {
  return <CodeEditor {...props} lang={gdscript} />
}

// ── GDShader editor ─────────────────────────────────────────────────────
function GdShaderEditor(props: FileViewerProps) {
  return <CodeEditor {...props} lang={gdshader} />
}

/**
 * Plugin entry point.
 * Registers GDScript & GDShader file viewers with dsh-better-sidebar.
 */
export function apply(ctx: Context) {
  ctx.effect(() => {
    // ── GDScript viewer ──────────────────────────────────────
    const disposeGd = ctx.betterSidebar.registerFileViewer({
      id: 'dsh-sidebar-gdhighlight:gdscript',
      title: 'GDScript',
      exts: ['gd', 'inc'],
      priority: 10,
      fetchStrategy: 'fsRead',
      component: GdScriptEditor,
    })

    // ── GDShader viewer ──────────────────────────────────────
    const disposeShader = ctx.betterSidebar.registerFileViewer({
      id: 'dsh-sidebar-gdhighlight:gdshader',
      title: 'GDShader',
      exts: ['gdshader', 'shader'],
      priority: 10,
      fetchStrategy: 'fsRead',
      component: GdShaderEditor,
    })

    console.log('[dsh-sidebar-gdhighlight] GDScript + GDShader language support registered')

    return () => {
      disposeGd()
      disposeShader()
    }
  })
}

export { gdscript, isGdScript, GDSCRIPT_EXTENSIONS } from './gdscript-lang.js'
export { gdshader, isGdShader, GDSHADER_EXTENSIONS } from './gdshader-lang.js'
