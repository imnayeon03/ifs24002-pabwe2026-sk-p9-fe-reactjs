import { useCallback, useEffect, useState } from 'react'
import { IconDotsVertical, IconEye, IconPencil, IconTrash } from '@tabler/icons-react'
import PostStats from './PostStats'
import PostModal from '../modals/PostModal'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'
import {
  createPost,
  deletePost,
  getPostStats,
  listCategories,
  listMyPosts,
  togglePublish,
  updatePost,
} from '../api/blogApi'
import { showConfirmDialog, showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

function KebabMenu({ post, onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const act = (fn) => () => {
    setOpen(false)
    fn(post)
  }
  const item = 'flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-100'
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Aksi untuk ${post.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded p-1 hover:bg-slate-200"
        onClick={() => setOpen(!open)}
      >
        <IconDotsVertical size={20} aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-10 mt-1 w-40 rounded-md bg-white py-1 text-slate-900 shadow-lg ring-1 ring-slate-400">
          <button role="menuitem" type="button" className={item} onClick={act(onView)}>
            <IconEye size={16} aria-hidden="true" /> Lihat
          </button>
          <button role="menuitem" type="button" className={item} onClick={act(onEdit)}>
            <IconPencil size={16} aria-hidden="true" /> Ubah
          </button>
          <button role="menuitem" type="button" className={`${item} text-red-800`} onClick={act(onDelete)}>
            <IconTrash size={16} aria-hidden="true" /> Hapus
          </button>
        </div>
      )}
    </div>
  )
}

// Ruang kerja penulis (full width)
export default function AuthorDashboard({ navigate }) {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total: 0, total_terbit: 0, belum_selesai: 0 })
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState({ open: false, post: null })
  const [aiOpen, setAiOpen] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [p, s, c] = await Promise.all([listMyPosts(), getPostStats(), listCategories()])
      setPosts(p)
      setStats(s)
      setCategories(c)
    } catch (error) {
      await showErrorAlert(error.message)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const run = async (action, message) => {
    try {
      await action()
      await showSuccessAlert(message)
      await refresh()
    } catch (error) {
      await showErrorAlert(error.message)
    }
  }

  const save = async (payload) => {
    const { post } = modal
    setModal({ open: false, post: null })
    await run(() => (post?.id ? updatePost(post.id, payload) : createPost(payload)), 'Artikel tersimpan')
  }

  const remove = async (post) => {
    if (await showConfirmDialog('Hapus artikel?', post.title)) {
      await run(() => deletePost(post.id), 'Artikel dihapus')
    }
  }

  const applyDraft = (draft) => {
    setAiOpen(false)
    setModal({
      open: true,
      post: { title: draft.title, category: draft.category, excerpt: draft.excerpt, content: draft.content },
    })
  }

  return (
    <main className="w-full space-y-6 p-6">
      <h1 className="text-2xl font-bold">Ruang Kerja Penulis</h1>
      <PostStats stats={stats} />
      <div className="flex justify-end gap-2">
        <button type="button" className="rounded-md bg-violet-800 px-4 py-2 font-semibold text-white" onClick={() => setAiOpen(true)}>
          AI Generator
        </button>
        <button type="button" className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white" onClick={() => setModal({ open: true, post: null })}>
          Tambah Artikel
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white text-slate-900 shadow">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Daftar artikel saya</caption>
          <thead className="bg-blue-100">
            <tr>
              <th scope="col" className="px-4 py-3">Judul</th>
              <th scope="col" className="px-4 py-3">Kategori</th>
              <th scope="col" className="px-4 py-3">Terbit</th>
              <th scope="col" className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-t border-slate-300">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">{post.category}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={post.is_published}
                    aria-label={`Terbitkan ${post.title}`}
                    onClick={() => run(() => togglePublish(post.id), 'Status publikasi diubah')}
                    className={`relative h-6 w-11 rounded-full ${post.is_published ? 'bg-emerald-800' : 'bg-slate-600'}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${post.is_published ? 'left-5' : 'left-0.5'}`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <KebabMenu
                    post={post}
                    onView={(p) => navigate(`/posts/${p.slug}`)}
                    onEdit={(p) => setModal({ open: true, post: p })}
                    onDelete={remove}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PostModal
        key={modal.post ? `${modal.post.id || 'draft'}-${modal.post.title}` : 'new'}
        open={modal.open}
        post={modal.post}
        categories={categories}
        onClose={() => setModal({ open: false, post: null })}
        onSubmit={save}
      />
      <AiPostGeneratorModal open={aiOpen} categories={categories} onClose={() => setAiOpen(false)} onApply={applyDraft} />
    </main>
  )
}
