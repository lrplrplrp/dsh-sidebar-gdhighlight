/**
 * dsh-sidebar-gdhighlight — client (browser) side.
 *
 * DSH plugin that adds GDScript syntax highlighting to dsh-better-sidebar.
 * Registers a custom file viewer for .gd files using CodeMirror with GDScript language.
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
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { gdscript } from './gdscript-lang.js'

export const name = 'dsh-sidebar-gdhighlight'

export const inject = ['betterSidebar']

/**
 * GDScript code editor component for CodeMirror 6
 */
function GdScriptEditor({ content, path, scope }: FileViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!content || !hostRef.current) return

    // Create CodeMirror editor with GDScript language
    const state = EditorState.create({
      doc: content,
      extensions: [
        EditorView.lineWrapping,
        lineNumbers(),
        history(),
        EditorState.tabSize.of(4),
        EditorView.contentAttributes.of({ spellcheck: 'false' }),
        gdscript(), // GDScript language support
        syntaxHighlighting(defaultHighlightStyle), // Apply syntax coloring
        keymap.of([...defaultKeymap, ...historyKeymap]),
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

/**
 * Plugin entry point.
 * Registers GDScript file viewer with dsh-better-sidebar.
 */
export function apply(ctx: Context) {
  ctx.effect(() => {
    // Register GDScript file viewer with better-sidebar
    // This will handle .gd files with syntax highlighting
    const disposer = ctx.betterSidebar.registerFileViewer({
      id: 'dsh-sidebar-gdhighlight:gdscript',
      title: 'GDScript',
      exts: ['gd'],
      priority: 10, // Higher priority than the catch-all 'code' viewer (-100)
      fetchStrategy: 'fsRead', // GDScript files are text, read from the filesystem
      component: GdScriptEditor,
    })

    console.log('[dsh-sidebar-gdhighlight] GDScript language support registered')

    return disposer
  })
}

export { gdscript, isGdScript, GDSCRIPT_EXTENSIONS } from './gdscript-lang.js'
