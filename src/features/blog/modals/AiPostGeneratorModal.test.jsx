import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { generateDraft } from '../api/blogApi'
import AiPostGeneratorModal from './AiPostGeneratorModal'

vi.mock('../api/blogApi', () => ({ generateDraft: vi.fn() }))
vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ content }) => globalThis.h('div', { 'data-testid': 'viewer' }, content),
}))

const draft = {
  title: 'Draf Judul',
  category: 'Teknologi',
  excerpt: 'Draf ringkasan',
  content: '# Draf isi',
  sources: [{ title: 'Sumber 1', url: 'https://s1.test', snippet: 's' }],
}

describe('AiPostGeneratorModal', () => {
  it('menolak topik kosong', async () => {
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    expect(screen.getByRole('dialog', { name: 'AI Blog Generator' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Topik wajib diisi')
    expect(generateDraft).not.toHaveBeenCalled()
  })

  it('membuat draf dengan sumber lalu menerapkannya ke editor', async () => {
    generateDraft.mockResolvedValueOnce(draft)
    const onApply = vi.fn()
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText(/Topik Artikel/), 'Belajar AI')
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Sedang membuat draf…')
    expect(await screen.findByRole('heading', { level: 2, name: draft.title })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sumber 1' })).toHaveAttribute('href', 'https://s1.test')
    expect(screen.getByTestId('viewer')).toHaveTextContent('# Draf isi')
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan ke Editor' }))
    expect(onApply).toHaveBeenCalledWith(draft)
  })

  it('dapat menonaktifkan search engine dan menangani draf tanpa sumber', async () => {
    generateDraft.mockResolvedValueOnce({ ...draft, sources: [] })
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/Topik Artikel/), 'Topik')
    const checkbox = screen.getByRole('checkbox', { name: /Gunakan Search Engine/ })
    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    expect(generateDraft).toHaveBeenCalledWith(expect.objectContaining({ use_search: false }))
    expect(await screen.findByRole('heading', { level: 2, name: draft.title })).toBeInTheDocument()
    expect(screen.queryByText('Sumber Referensi')).not.toBeInTheDocument()
  })

  it('menampilkan error dari API generator', async () => {
    generateDraft.mockRejectedValueOnce(new Error('AI sedang sibuk'))
    render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/Topik Artikel/), 'Topik')
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('AI sedang sibuk')
  })

  it('menutup modal dengan tombol silang dan tombol batal', async () => {
    const onClose = vi.fn()
    const { unmount } = render(<AiPostGeneratorModal onClose={onClose} onApply={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Tutup dialog' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    unmount()

    const onClose2 = vi.fn()
    render(<AiPostGeneratorModal onClose={onClose2} onApply={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose2).toHaveBeenCalledTimes(1)
  })

  it('mengabaikan hasil setelah unmount', async () => {
    let resolve
    generateDraft.mockReturnValueOnce(new Promise((r) => (resolve = r)))
    const { unmount } = render(<AiPostGeneratorModal onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/Topik Artikel/), 'Topik')
    await userEvent.click(screen.getByRole('button', { name: 'Generate Draf' }))
    unmount()
    await act(async () => resolve(draft))
    expect(generateDraft).toHaveBeenCalledTimes(1)
  })
})
