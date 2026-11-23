import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { createPost, updatePost } from '../api/blogApi'
import PostModal from './PostModal'

vi.mock('../api/blogApi', () => ({ createPost: vi.fn(), updatePost: vi.fn() }))
vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ value, onChange }) =>
    globalThis.h('textarea', { 'aria-label': 'Konten', value, onChange: (e) => onChange(e.target.value) }),
}))

const handlers = () => ({ onClose: vi.fn(), onSaved: vi.fn() })

describe('PostModal', () => {
  it('menolak simpan bila judul/konten kosong', async () => {
    const h = handlers()
    render(<PostModal theme="light" {...h} />)
    expect(screen.getByRole('dialog', { name: 'Tambah Artikel' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Judul dan konten artikel wajib diisi')
    expect(createPost).not.toHaveBeenCalled()
  })

  it('membuat artikel baru', async () => {
    createPost.mockResolvedValueOnce({ id: 9 })
    const h = handlers()
    render(<PostModal theme="light" {...h} />)
    await userEvent.type(screen.getByLabelText(/Judul Artikel/), 'Judul Baru')
    await userEvent.type(screen.getByLabelText('Konten'), 'Isi Konten')
    await userEvent.type(screen.getByLabelText(/Ringkasan Singkat/), 'Ringkasan')
    await userEvent.type(screen.getByLabelText(/URL Gambar Sampul/), 'https://img.test/a.jpg')
    await userEvent.selectOptions(screen.getByLabelText(/Kategori/), 'Teknologi')
    await userEvent.click(screen.getByLabelText(/Terbitkan langsung/))
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(createPost).toHaveBeenCalledWith({
      title: 'Judul Baru',
      content: 'Isi Konten',
      excerpt: 'Ringkasan',
      cover_image_path: 'https://img.test/a.jpg',
      category: 'Teknologi',
      is_published: true,
    })
    expect(h.onSaved).toHaveBeenCalledWith({ id: 9 })
  })

  it('memperbarui artikel lama dengan data awal', async () => {
    updatePost.mockResolvedValueOnce({ id: 3 })
    const existing = {
      id: 3,
      title: 'Lama',
      category: 'Bisnis',
      excerpt: 'Ex',
      cover_image_path: 'https://x.jpg',
      content: 'Isi',
      is_published: true,
    }
    const h = handlers()
    render(<PostModal post={existing} theme="dark" {...h} />)
    expect(screen.getByRole('dialog', { name: 'Edit Artikel' })).toBeInTheDocument()
    const title = screen.getByLabelText(/Judul Artikel/)
    await userEvent.clear(title)
    await userEvent.type(title, 'Baru')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(updatePost).toHaveBeenCalledWith(3, expect.objectContaining({ title: 'Baru' }))
    expect(h.onSaved).toHaveBeenCalled()
  })

  it('mengisi form dari draft AI jika tersedia', () => {
    const draft = { title: 'Draft AI', category: 'Kesehatan', excerpt: 'Ringkas', content: 'Konten AI' }
    render(<PostModal draft={draft} {...handlers()} />)
    expect(screen.getByLabelText(/Judul Artikel/)).toHaveValue('Draft AI')
    expect(screen.getByLabelText(/Kategori/)).toHaveValue('Kesehatan')
    expect(screen.getByLabelText('Konten')).toHaveValue('Konten AI')
  })

  it('menampilkan error saat gagal simpan', async () => {
    createPost.mockRejectedValueOnce(new Error('Gagal dari server'))
    render(<PostModal {...handlers()} />)
    await userEvent.type(screen.getByLabelText(/Judul Artikel/), 'T')
    await userEvent.type(screen.getByLabelText('Konten'), 'C')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal dari server')
  })

  it('menutup dialog via tombol silang, batal, dan tombol Escape', async () => {
    const h = handlers()
    const { unmount } = render(<PostModal {...h} />)
    await userEvent.click(screen.getByRole('button', { name: 'Tutup dialog' }))
    expect(h.onClose).toHaveBeenCalledTimes(1)
    unmount()

    const h2 = handlers()
    const { unmount: unmount2 } = render(<PostModal {...h2} />)
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(h2.onClose).toHaveBeenCalledTimes(1)
    unmount2()

    const h3 = handlers()
    render(<PostModal {...h3} />)
    await userEvent.keyboard('{Escape}')
    expect(h3.onClose).toHaveBeenCalledTimes(1)
  })
})
