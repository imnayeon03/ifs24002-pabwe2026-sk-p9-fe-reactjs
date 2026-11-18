import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../../components/MarkdownEditor', () => ({
  default: ({ onChange, label }) => <textarea aria-label={label} onChange={(e) => onChange(e.target.value)} />,
}))
vi.mock('../../components/MarkdownViewer', () => ({ default: ({ value }) => <div>{value}</div> }))
vi.mock('./api/blogApi')
vi.mock('../../helpers/toolsHelper', async (orig) => ({
  ...(await orig()),
  showErrorAlert: vi.fn().mockResolvedValue(),
  showSuccessAlert: vi.fn().mockResolvedValue(),
  showConfirmDialog: vi.fn(),
}))
import * as api from './api/blogApi'
import { showConfirmDialog, showErrorAlert } from '../../helpers/toolsHelper'
import StickyNavbar from './components/StickyNavbar'
import PublicArticleList from './components/PublicArticleList'
import PublicArticleDetail from './components/PublicArticleDetail'
import PostStats from './components/PostStats'
import AuthorDashboard from './components/AuthorDashboard'
import PostModal from './modals/PostModal'
import AiPostGeneratorModal from './modals/AiPostGeneratorModal'
import { expectNoAxeViolations } from '../../test/axe'

const cats = ['Teknologi', 'Umum']
const post = { id: 1, title: 'Belajar Go', slug: 'belajar-go', category: 'Teknologi', excerpt: 'Ringkas', content: '# isi', is_published: true, published_at: '2026-11-18', reading_time: 3, author: { username: 'budi' }, cover_image_path: '/c.png' }
const draftPost = { id: 2, title: 'Draf', slug: 'draf', category: 'Umum', is_published: false }

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset?.())
  showConfirmDialog.mockReset()
  showErrorAlert.mockClear()
  api.listCategories.mockResolvedValue(cats)
  api.listPublicPosts.mockResolvedValue([post])
  api.listMyPosts.mockResolvedValue([post, draftPost])
  api.getPostStats.mockResolvedValue({ total: 2, total_terbit: 1, belum_selesai: 1 })
})

describe('StickyNavbar', () => {
  it('guest melihat Login/Register', async () => {
    const navigate = vi.fn()
    const { container } = render(<StickyNavbar user={null} navigate={navigate} />)
    await userEvent.click(screen.getByRole('link', { name: 'Login' }))
    expect(navigate).toHaveBeenCalledWith('/login')
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })
  it('penulis dan admin', async () => {
    const onLogout = vi.fn()
    const { rerender } = render(<StickyNavbar user={{ username: 'a', role: 'member' }} navigate={vi.fn()} onLogout={onLogout} />)
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Keluar/ }))
    expect(onLogout).toHaveBeenCalled()
    rerender(<StickyNavbar user={{ username: 'a', role: 'admin' }} navigate={vi.fn()} onLogout={onLogout} />)
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ruang Penulis' })).toBeInTheDocument()
  })
})

describe('PublicArticleList', () => {
  it('menampilkan artikel, tanpa pelanggaran axe', async () => {
    const { container } = render(<PublicArticleList navigate={vi.fn()} />)
    expect(await screen.findByText('Belajar Go')).toBeInTheDocument()
    await screen.findByRole('button', { name: 'Teknologi' })
    await expectNoAxeViolations(container)
  })
  it('pencarian dan filter kategori', async () => {
    render(<PublicArticleList navigate={vi.fn()} />)
    await screen.findByText('Belajar Go')
    await userEvent.type(screen.getByLabelText('Cari artikel'), 'go')
    await waitFor(() => expect(api.listPublicPosts).toHaveBeenLastCalledWith('go', ''))
    await userEvent.click(await screen.findByRole('button', { name: 'Teknologi' }))
    await waitFor(() => expect(api.listPublicPosts).toHaveBeenLastCalledWith('go', 'Teknologi'))
    await userEvent.click(screen.getByRole('button', { name: 'Semua' }))
    await waitFor(() => expect(api.listPublicPosts).toHaveBeenLastCalledWith('go', ''))
  })
  it('klik judul membuka detail', async () => {
    const navigate = vi.fn()
    render(<PublicArticleList navigate={navigate} />)
    await userEvent.click(await screen.findByRole('link', { name: 'Belajar Go' }))
    expect(navigate).toHaveBeenCalledWith('/posts/belajar-go')
  })
  it('error memuat kategori dan artikel', async () => {
    api.listCategories.mockRejectedValue(new Error('kat gagal'))
    api.listPublicPosts.mockRejectedValue(new Error('post gagal'))
    render(<PublicArticleList navigate={vi.fn()} />)
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('kat gagal'))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('post gagal'))
  })
})

describe('PublicArticleDetail', () => {
  it('menampilkan artikel dengan sampul', async () => {
    api.getPublicPost.mockResolvedValue(post)
    const navigate = vi.fn()
    const { container } = render(<PublicArticleDetail slug="belajar-go" navigate={navigate} />)
    expect(screen.getByText('Memuat...')).toBeInTheDocument()
    expect(await screen.findByText('Belajar Go')).toBeInTheDocument()
    expect(screen.getByAltText('Sampul Belajar Go')).toBeInTheDocument()
    await expectNoAxeViolations(container)
    await userEvent.click(screen.getByRole('button', { name: /Kembali/ }))
    expect(navigate).toHaveBeenCalledWith('/')
  })
  it('tanpa sampul', async () => {
    api.getPublicPost.mockResolvedValue({ ...post, cover_image_path: '' })
    render(<PublicArticleDetail slug="x" navigate={vi.fn()} />)
    await screen.findByText('Belajar Go')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
  it('error', async () => {
    api.getPublicPost.mockRejectedValue(new Error('tidak ada'))
    render(<PublicArticleDetail slug="x" navigate={vi.fn()} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('tidak ada')
  })
})

describe('PostStats', () => {
  it('3 kartu', async () => {
    const { container } = render(<PostStats stats={{ total: 5, total_terbit: 2, belum_selesai: 3 }} />)
    expect(screen.getByText('Total Terbit')).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })
})

describe('PostModal', () => {
  it('tertutup', () => {
    expect(render(<PostModal open={false} categories={cats} />).container).toBeEmptyDOMElement()
  })
  it('tambah baru, tanpa pelanggaran axe', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<PostModal open post={null} categories={cats} onClose={vi.fn()} onSubmit={onSubmit} />)
    await expectNoAxeViolations(container)
    await userEvent.type(screen.getByLabelText('Judul'), 'Baru')
    await userEvent.type(screen.getByLabelText('Ringkasan'), 'rk')
    await userEvent.type(screen.getByLabelText('Editor isi artikel'), 'isi')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Baru', category: 'Umum', excerpt: 'rk', content: 'isi' })
  })
  it('ubah, draf tanpa kolom, dan batal', async () => {
    const onClose = vi.fn()
    const { rerender } = render(<PostModal open post={post} categories={cats} onClose={onClose} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Judul')).toHaveValue('Belajar Go')
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
    rerender(<PostModal key="d" open post={{ title: '', category: '' }} categories={cats} onClose={onClose} onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Tambah Artikel' })).toBeInTheDocument()
  })
})

describe('AiPostGeneratorModal', () => {
  const draft = { title: 'Draf AI', category: 'Teknologi', excerpt: 'Ex', content: 'C', sources: [{ title: 'Sumber', url: 'https://a.id' }] }
  it('tertutup', () => {
    expect(render(<AiPostGeneratorModal open={false} categories={cats} />).container).toBeEmptyDOMElement()
  })
  it('hasilkan dengan search, terapkan, tanpa pelanggaran axe', async () => {
    api.aiGeneratePost.mockResolvedValue(draft)
    const onApply = vi.fn()
    const { container } = render(<AiPostGeneratorModal open categories={cats} onClose={vi.fn()} onApply={onApply} />)
    expect(screen.getByRole('button', { name: 'Hasilkan Artikel' })).toBeDisabled()
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'Go')
    await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'Teknologi')
    await userEvent.click(screen.getByRole('button', { name: 'Hasilkan Artikel' }))
    expect(await screen.findByText('Draf AI')).toBeInTheDocument()
    expect(api.aiGeneratePost).toHaveBeenCalledWith('Go', 'Teknologi', true)
    await expectNoAxeViolations(container)
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan ke Editor' }))
    expect(onApply).toHaveBeenCalledWith(draft)
  })
  it('tanpa search dan tanpa sumber, serta batal', async () => {
    api.aiGeneratePost.mockResolvedValue({ ...draft, sources: undefined })
    const onClose = vi.fn()
    render(<AiPostGeneratorModal open categories={cats} onClose={onClose} onApply={vi.fn()} />)
    await userEvent.click(screen.getByLabelText('Sertakan penelusuran Search Engine'))
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'Go')
    await userEvent.click(screen.getByRole('button', { name: 'Hasilkan Artikel' }))
    await screen.findByText('Draf AI')
    expect(api.aiGeneratePost).toHaveBeenCalledWith('Go', 'Umum', false)
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onClose).toHaveBeenCalled()
  })
  it('error AI', async () => {
    api.aiGeneratePost.mockRejectedValue(new Error('AI mati'))
    render(<AiPostGeneratorModal open categories={cats} onClose={vi.fn()} onApply={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Topik artikel'), 'Go')
    await userEvent.click(screen.getByRole('button', { name: 'Hasilkan Artikel' }))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('AI mati'))
  })
})

describe('AuthorDashboard', () => {
  it('memuat data, tanpa pelanggaran axe', async () => {
    const { container } = render(<AuthorDashboard navigate={vi.fn()} />)
    expect(await screen.findByText('Belajar Go')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Aksi untuk Belajar Go' }))
    await expectNoAxeViolations(container)
  })
  it('gagal memuat', async () => {
    api.listMyPosts.mockRejectedValue(new Error('gagal muat'))
    render(<AuthorDashboard navigate={vi.fn()} />)
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal muat'))
  })
  it('toggle publikasi, berhasil dan gagal', async () => {
    api.togglePublish.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('gagal toggle'))
    render(<AuthorDashboard navigate={vi.fn()} />)
    await screen.findByText('Belajar Go')
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan Belajar Go' }))
    await waitFor(() => expect(api.togglePublish).toHaveBeenCalledWith(1))
    await userEvent.click(screen.getByRole('switch', { name: 'Terbitkan Draf' }))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal toggle'))
  })
  it('tambah artikel, lalu batal', async () => {
    api.createPost.mockResolvedValue({})
    render(<AuthorDashboard navigate={vi.fn()} />)
    await screen.findByText('Belajar Go')
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Artikel' }))
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Artikel' }))
    await userEvent.type(screen.getByLabelText('Judul'), 'Baru')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(api.createPost).toHaveBeenCalled())
  })
  it('lihat, ubah, dan hapus (dengan dan tanpa konfirmasi)', async () => {
    api.updatePost.mockResolvedValue({})
    api.deletePost.mockResolvedValue({})
    const navigate = vi.fn()
    render(<AuthorDashboard navigate={navigate} />)
    await screen.findByText('Belajar Go')
    const menu = async (name) => {
      await userEvent.click(screen.getByRole('button', { name: 'Aksi untuk Belajar Go' }))
      await userEvent.click(screen.getByRole('menuitem', { name }))
    }
    await menu(/Lihat/)
    expect(navigate).toHaveBeenCalledWith('/posts/belajar-go')
    await menu(/Ubah/)
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(api.updatePost).toHaveBeenCalledWith(1, expect.any(Object)))
    showConfirmDialog.mockResolvedValueOnce(false)
    await menu(/Hapus/)
    expect(api.deletePost).not.toHaveBeenCalled()
    showConfirmDialog.mockResolvedValueOnce(true)
    await menu(/Hapus/)
    await waitFor(() => expect(api.deletePost).toHaveBeenCalledWith(1))
  })
  it('AI generator menerapkan draf ke editor lalu menyimpan sebagai artikel baru', async () => {
    api.aiGeneratePost.mockResolvedValue({ title: 'Draf AI', category: 'Umum', excerpt: 'E', content: 'C' })
    api.createPost.mockResolvedValue({})
    render(<AuthorDashboard navigate={vi.fn()} />)
    await screen.findByText('Belajar Go')
    await userEvent.click(screen.getByRole('button', { name: 'AI Generator' }))
    const dialog = screen.getByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Topik artikel'), 'Go')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Hasilkan Artikel' }))
    await within(dialog).findByText('Draf AI')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Terapkan ke Editor' }))
    expect(await screen.findByLabelText('Judul')).toHaveValue('Draf AI')
    await userEvent.click(screen.getByRole('button', { name: 'Simpan' }))
    await waitFor(() => expect(api.createPost).toHaveBeenCalled())
  })
  it('menutup AI generator', async () => {
    render(<AuthorDashboard navigate={vi.fn()} />)
    await screen.findByText('Belajar Go')
    await userEvent.click(screen.getByRole('button', { name: 'AI Generator' }))
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Batal' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
