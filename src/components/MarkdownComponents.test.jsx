import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

const destroy = vi.fn()
const instances = []
vi.mock('@toast-ui/editor', () => {
  class Editor {
    constructor(opts) {
      this.opts = opts
      // meniru markup asli Toast UI (atribut `aria-role` tak valid + textarea tanpa label)
      opts.el.innerHTML =
        '<div class="toastui-editor-tabs" aria-role="tabpanel"><div class="tab-item" aria-role="tab" tabindex="0">Write</div></div><textarea></textarea>'
      instances.push(this)
    }
    getMarkdown() {
      return '# md'
    }
    destroy() {
      destroy()
    }
    static factory(opts) {
      instances.push({ viewer: true, opts })
      return { destroy }
    }
  }
  return { default: Editor }
})

import MarkdownEditor from './MarkdownEditor'
import MarkdownViewer from './MarkdownViewer'
import { expectNoAxeViolations } from '../test/axe'

describe('MarkdownEditor', () => {
  it('membuat editor, meneruskan perubahan, dan membersihkan', () => {
    const onChange = vi.fn()
    const { unmount, container } = render(<MarkdownEditor value="x" onChange={onChange} dark />)
    const editor = instances.at(-1)
    expect(editor.opts.theme).toBe('dark')
    editor.opts.events.change()
    expect(onChange).toHaveBeenCalledWith('# md')
    unmount()
    expect(destroy).toHaveBeenCalled()
    expect(container).toBeTruthy()
  })

  it('memperbaiki ARIA bawaan Toast UI', () => {
    const { container } = render(<MarkdownEditor />)
    expect(container.querySelector('[aria-role]')).toBeNull()
    expect(container.querySelector('.toastui-editor-tabs')).toHaveAttribute('role', 'tablist')
    expect(container.querySelector('.tab-item')).toHaveAttribute('role', 'tab')
    expect(container.querySelector('textarea')).toHaveAttribute('aria-label')
  })

  it('tidak error tanpa onChange dan tema terang', () => {
    render(<MarkdownEditor />)
    const editor = instances.at(-1)
    expect(editor.opts.theme).toBe('light')
    expect(() => editor.opts.events.change()).not.toThrow()
  })

  it('tanpa pelanggaran axe', async () => {
    const { container } = render(<MarkdownEditor />)
    await expectNoAxeViolations(container)
  })
})

describe('MarkdownViewer', () => {
  it('merender viewer dengan nilai bawaan kosong', () => {
    render(<MarkdownViewer />)
    expect(instances.at(-1).viewer).toBe(true)
    render(<MarkdownViewer value="# a" />)
    expect(instances.at(-1).opts.initialValue).toBe('# a')
  })
})
