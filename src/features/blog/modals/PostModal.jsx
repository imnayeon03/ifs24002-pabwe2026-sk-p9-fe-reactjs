import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import MarkdownEditor from '../../../components/MarkdownEditor'

const field = 'mt-1 block w-full rounded-md border border-slate-500 bg-white px-3 py-2 text-slate-900'

// Modal penulisan artikel layar penuh dengan header & footer berwarna kontras
export default function PostModal({ open, post, categories, onClose, onSubmit }) {
  const [title, onTitle] = useInput(post?.title || '')
  const [category, onCategory] = useInput(post?.category || 'Umum')
  const [excerpt, onExcerpt] = useInput(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || '')
  if (!open) return null

  const submit = (event) => {
    event.preventDefault()
    onSubmit({ title, category, excerpt, content })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        className="h-[96vh] w-full max-w-[96vw] overflow-hidden rounded-xl bg-white text-slate-900"
      >
        <form onSubmit={submit} className="flex h-full flex-col">
          <header className="bg-blue-700 px-6 py-4 text-white">
            <h2 id="post-modal-title" className="text-xl font-bold">{post?.id ? 'Ubah Artikel' : 'Tambah Artikel'}</h2>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="post-title" className="text-sm font-medium">Judul</label>
                <input id="post-title" className={field} value={title} onChange={onTitle} required />
              </div>
              <div>
                <label htmlFor="post-category" className="text-sm font-medium">Kategori</label>
                <select id="post-category" className={field} value={category} onChange={onCategory}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="post-excerpt" className="text-sm font-medium">Ringkasan</label>
              <textarea id="post-excerpt" rows={2} className={field} value={excerpt} onChange={onExcerpt} />
            </div>
            <div>
              <p className="text-sm font-medium">Isi artikel (Markdown)</p>
              <MarkdownEditor value={content} onChange={setContent} label="Editor isi artikel" />
            </div>
          </div>
          <footer className="flex justify-end gap-2 bg-slate-200 px-6 py-3">
            <button type="button" className="rounded-md bg-white px-4 py-2 font-medium text-slate-900 ring-1 ring-slate-500" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white">
              Simpan
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
