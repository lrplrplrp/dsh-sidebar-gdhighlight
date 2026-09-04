/**
 * dsh-sidebar-gdhighlight — client (browser) side.
 *
 * DSH plugin that adds GDScript & GDShader syntax highlighting to
 * dsh-better-sidebar, using Godot 4.7 editor colors.
 *
 * Key features replicated from better-sidebar's built-in TextEditor:
 * - Selection popup "Add to conversation" button
 * - Line-number gutter styling
 * - Dark theme integration
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

// ════════════════════════════════════════════════════════════════════════════
//  Utility functions replicated from better-sidebar's client-editor.ts
// ════════════════════════════════════════════════════════════════════════════

/** Relative path from cwd to path (mirrors better-sidebar) */
function relativeTo(cwd: string, path: string): string {
  const base = cwd.replace(/[\\/]+$/, '')
  const norm = (v: string) => v.replace(/\\/g, '/')
  const nBase = norm(base)
  const nPath = norm(path)
  if (nPath === nBase) return '.'
  if (nPath.toLowerCase().startsWith(`${nBase.toLowerCase()}/`)) return nPath.slice(nBase.length + 1)
  return path
}

/** Build the fenced-code header for a selection */
function headerOf(path: string, cwd: string, lines: { start: number; end: number } | undefined): string {
  const rel = cwd !== undefined ? relativeTo(cwd, path) : path
  if (lines === undefined) return rel
  if (lines.end > lines.start) return `${rel}:${lines.start}-${lines.end}`
  return `${rel}:${lines.start}`
}

/** Build the full text inserted into the composer draft for one selection */
function buildInsert(path: string, cwd: string, lines: { start: number; end: number } | undefined, selected: string): string {
  const header = headerOf(path, cwd, lines)
  if (selected.length > 500) return header
  return `\`\`\`${header}\n${selected}\n\`\`\``
}

/** 1-based line number of a character index */
function lineAt(source: string, index: number): number {
  let line = 1
  for (let i = 0; i < index && i < source.length; i++) if (source[i] === '\n') line++
  return line
}

/** Parse line range from a DOM text selection */
function linesOfSelection(source: string, selected: string): { start: number; end: number } | null {
  const text = selected.endsWith('\n') ? selected.slice(0, -1) : selected
  if (text === '') return null
  const at = source.indexOf(text)
  if (at === -1) return null
  if (source.indexOf(text, at + 1) !== -1) return null
  return {
    start: lineAt(source, at),
    end: lineAt(source, at + Math.max(text.length - 1, 0))
  }
}

/** Find the composer textarea in the conversation column */
function findComposerTextarea(): HTMLTextAreaElement | null {
  if (typeof document === 'undefined') return null
  const column = document.querySelector('#root [data-slot="conversation"]')
  if (!column) return document.querySelector('textarea[data-phase]') as HTMLTextAreaElement | null
  return (column.querySelector('textarea[data-phase]') ?? column.querySelector('textarea')) as HTMLTextAreaElement | null
}

/** Probe the live caret position of the composer textarea */
function probeComposerCaret(draft: string): { start: number; end: number } | null {
  const el = findComposerTextarea()
  if (!el || el.disabled || el.readOnly) return null
  if (el.value !== draft) return null
  let start = el.selectionStart
  let end = el.selectionEnd
  if (typeof start !== 'number' || typeof end !== 'number') return null
  start = Math.max(0, Math.min(start, draft.length))
  end = Math.max(start, Math.min(end, draft.length))
  return { start, end }
}

/** Place the caret after a programmatic draft update */
function placeCaretAfter(expectedDraft: string, caretIndex: number): void {
  let remaining = 2
  let scheduled = false
  const schedule = (fn: () => void) => {
    if (scheduled) return
    scheduled = true
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fn)
    else setTimeout(fn, 0)
  }
  const place = () => {
    scheduled = false
    if (remaining <= 0) return
    remaining -= 1
    const el = findComposerTextarea()
    if (!el || el.disabled || el.readOnly) return
    if (el.value !== expectedDraft) { schedule(place); return }
    const clamped = Math.max(0, Math.min(caretIndex, el.value.length))
    el.setSelectionRange(clamped, clamped)
  }
  schedule(place)
}

/** Append text to the session's composer draft at the live caret */
function appendToDraft(ctx: Context, sessionId: string, text: string): boolean {
  try {
    const actx = ctx.sessions.scope(sessionId)
    if (actx === undefined) return false
    const conversation = ctx.get('conversation') as any
    if (!conversation) return false
    const input = conversation.input.for(actx)
    const draft = input.state.getSnapshot().draft as string

    // Splice text at caret, or append
    const caret = probeComposerCaret(draft)
    let next: string
    let caretAfter: number

    if (caret === null || draft === '') {
      next = draft.trim() === '' ? text : `${draft} ${text}`
      caretAfter = next.length
    } else {
      const prefix = draft.slice(0, caret.start)
      const suffix = draft.slice(caret.end)
      const left = prefix === '' || /\s$/.test(prefix) ? '' : ' '
      const right = suffix === '' || /^\s/.test(suffix) ? '' : ' '
      next = `${prefix}${left}${text}${right}${suffix}`
      caretAfter = prefix.length + left.length + text.length
    }

    input.setDraft(next)
    placeCaretAfter(next, caretAfter)
    return true
  } catch {
    return false
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  Selection Popup hook (mirrors better-sidebar's useSelectionPopup)
// ════════════════════════════════════════════════════════════════════════════

interface SelectionPopupState {
  insert: string
  left: number
  top: number
}

function useSelectionPopup(onCommit: (insert: string) => void) {
  const onCommitRef = useRef(onCommit)
  onCommitRef.current = onCommit
  const [popup, setPopup] = useState<SelectionPopupState | null>(null)
  const popupRef = useRef<SelectionPopupState | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const show = useCallback((insert: string, left: number, top: number) => {
    const next: SelectionPopupState = {
      insert,
      left: Math.min(Math.max(left, 80), (typeof window !== 'undefined' ? window.innerWidth : 1000) - 80),
      top
    }
    popupRef.current = next
    setPopup(next)
  }, [])

  const hide = useCallback(() => {
    popupRef.current = null
    setPopup(null)
  }, [])

  const commit = useCallback(() => {
    const current = popupRef.current
    if (!current) return
    onCommitRef.current(current.insert)
    hide()
  }, [hide])

  // Global dismissal: outside-click, Escape, tab/window blur, viewport leave
  useEffect(() => {
    if (!popup) return
    const onMouseDown = (e: MouseEvent) => {
      if (popupRef.current === null) return
      const btn = buttonRef.current
      if (btn && (btn === e.target || btn.contains(e.target as Node))) return
      hide()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popupRef.current !== null) hide()
    }
    const onVisibilityChange = () => {
      if (document.hidden && popupRef.current !== null) hide()
    }
    document.addEventListener('mousedown', onMouseDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('mousedown', onMouseDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [popup !== null, hide])

  return { popup, buttonRef, show, hide, commit }
}

// ════════════════════════════════════════════════════════════════════════════
//  CodeMirror editor with selection popup & add-to-conversation
// ════════════════════════════════════════════════════════════════════════════

function CodeEditorWithPopup({
  content,
  path,
  scope,
  lang,
  ctx,
}: FileViewerProps & { lang: () => any; ctx: Context }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const cwd = scope?.cwd

  const handleCommit = useCallback((insert: string) => {
    if (scope?.sessionId) appendToDraft(ctx, scope.sessionId, insert)
  }, [ctx, scope?.sessionId])

  const { popup, buttonRef, show, hide, commit } = useSelectionPopup(handleCommit)

  // Build the selection insert payload
  const handleSelectionUpdate = useCallback((view: EditorView) => {
    const sel = view.state.selection.main
    if (sel.empty) { hide(); return }
    const text = view.state.sliceDoc(sel.from, sel.to).trim()
    if (text === '') { hide(); return }
    const rect = view.coordsAtPos(sel.head)
    if (!rect) { hide(); return }
    const doc = view.state.doc
    const lines = linesOfSelection(view.state.sliceDoc(0), text) ?? undefined
    const insert = buildInsert(path, cwd ?? '', lines, text)
    show(
      insert,
      rect.left + (rect.right - rect.left) / 2,
      rect.top
    )
  }, [path, cwd, show, hide])

  useEffect(() => {
    if (!content || !hostRef.current) return

    if (viewRef.current) {
      viewRef.current.destroy()
      viewRef.current = null
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          EditorView.lineWrapping,
          lineNumbers(),
          history(),
          EditorState.tabSize.of(4),
          EditorView.contentAttributes.of({ spellcheck: 'false' }),
          syntaxHighlighting(godotHighlightStyle),
          godotEditorTheme,
          keymap.of([...defaultKeymap, ...historyKeymap]),
          lang(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) return
            if (!update.view.hasFocus) { hide(); return }
            if (update.geometryChanged || update.viewportChanged) { hide(); return }
            if (update.selectionSet || update.focusChanged) handleSelectionUpdate(update.view)
          }),
        ],
      }),
      parent: hostRef.current,
    })

    viewRef.current = view
    return () => { view.destroy(); viewRef.current = null }
  }, [content, path, lang, handleSelectionUpdate, hide])

  // Hide popup on content change
  useEffect(() => { hide() }, [content, hide])

  return (
    <>
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
      {popup && createPortal(
        <button
          ref={buttonRef}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={commit}
          style={{
            position: 'fixed',
            left: popup.left,
            top: popup.top,
            transform: 'translate(-50%, calc(-100% - 8px))',
            zIndex: 60,
            border: '1px solid var(--dsw-alias-border-l1, #333)',
            background: 'var(--dsw-alias-bg-layer-2, #2a2a2a)',
            color: 'var(--dsw-alias-label-primary, #fff)',
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRadius: '6px',
            padding: '0 10px',
            height: '28px',
            display: 'inline-flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          添加到对话
        </button>,
        document.body
      )}
    </>
  )
}

// ── GDScript editor ─────────────────────────────────────────────────────
function GdScriptEditor(props: FileViewerProps & { ctx: Context }) {
  return <CodeEditorWithPopup {...props} lang={gdscript} />
}

// ── GDShader editor ─────────────────────────────────────────────────────
function GdShaderEditor(props: FileViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!props.content || !hostRef.current) return
    if (viewRef.current) { viewRef.current.destroy(); viewRef.current = null }

    const view = new EditorView({
      state: EditorState.create({
        doc: props.content,
        extensions: [
          EditorView.lineWrapping,
          lineNumbers(),
          history(),
          EditorState.tabSize.of(4),
          EditorView.contentAttributes.of({ spellcheck: 'false' }),
          syntaxHighlighting(godotHighlightStyle),
          godotEditorTheme,
          keymap.of([...defaultKeymap, ...historyKeymap]),
          gdshader(),
        ],
      }),
      parent: hostRef.current,
    })

    viewRef.current = view
    return () => { view.destroy(); viewRef.current = null }
  }, [props.content, props.path])

  return (
    <div ref={hostRef} style={{ height: '100%', width: '100%', overflow: 'auto', fontFamily: 'var(--font-mono, monospace)', fontSize: '14px', lineHeight: '1.5' }} />
  )
}

/**
 * Plugin entry point.
 */
export function apply(ctx: Context) {
  ctx.effect(() => {
    const disposeGd = ctx.betterSidebar.registerFileViewer({
      id: 'dsh-sidebar-gdhighlight:gdscript',
      title: 'GDScript',
      exts: ['gd', 'inc'],
      priority: 10,
      fetchStrategy: 'fsRead',
      component: (props: FileViewerProps) => <GdScriptEditor {...props} ctx={ctx} />,
    })

    const disposeShader = ctx.betterSidebar.registerFileViewer({
      id: 'dsh-sidebar-gdhighlight:gdshader',
      title: 'GDShader',
      exts: ['gdshader', 'shader'],
      priority: 10,
      fetchStrategy: 'fsRead',
      component: GdShaderEditor,
    })

    console.log('[dsh-sidebar-gdhighlight] GDScript + GDShader language support registered')

    return () => { disposeGd(); disposeShader() }
  })
}

export { gdscript, isGdScript, GDSCRIPT_EXTENSIONS } from './gdscript-lang.js'
export { gdshader, isGdShader, GDSHADER_EXTENSIONS } from './gdshader-lang.js'