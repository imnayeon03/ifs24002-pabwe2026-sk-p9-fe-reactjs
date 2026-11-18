import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'

// Toast UI memakai atribut tak valid `aria-role` dan textarea tanpa label; dirapikan agar lolos axe.
function repairAria(root) {
  root.querySelectorAll('[aria-role]').forEach((el) => {
    el.setAttribute('role', el.getAttribute('aria-role'))
    el.removeAttribute('aria-role')
  })
  root.querySelectorAll('.toastui-editor-tabs').forEach((el) => el.setAttribute('role', 'tablist'))
  root.querySelectorAll('textarea').forEach((el) => el.setAttribute('aria-label', 'Papan klip editor'))
}

// Wrapper Toast UI Editor (tab Markdown & preview) dengan tema gelap
export default function MarkdownEditor({ value = '', onChange, dark = false, label = 'Deskripsi' }) {
  const rootRef = useRef(null)
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const editor = new Editor({
      el: rootRef.current,
      initialValue: value,
      height: '360px',
      initialEditType: 'markdown',
      previewStyle: 'tab',
      theme: dark ? 'dark' : 'light',
      usageStatistics: false,
      events: { change: () => onChangeRef.current?.(editor.getMarkdown()) },
    })
    editorRef.current = editor
    repairAria(rootRef.current)
    return () => editor.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark])

  return <div ref={rootRef} role="group" aria-label={label} data-testid="markdown-editor" />
}
