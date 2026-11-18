import { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'

// Wrapper Toast UI Viewer untuk menampilkan Markdown secara aman
export default function MarkdownViewer({ value = '' }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const viewer = Editor.factory({ el: rootRef.current, viewer: true, initialValue: value })
    return () => viewer.destroy()
  }, [value])

  return <div ref={rootRef} data-testid="markdown-viewer" />
}
