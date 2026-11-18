import { useEffect, useState } from 'react'
import { listCategories, listPublicPosts } from '../api/blogApi'
import { formatDate, showErrorAlert } from '../../../helpers/toolsHelper'

// Galeri artikel publik: pencarian real-time + filter kategori berbentuk pill
export default function PublicArticleList({ navigate }) {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    listCategories().then(setCategories).catch((e) => showErrorAlert(e.message))
  }, [])

  useEffect(() => {
    listPublicPosts(q, category).then(setPosts).catch((e) => showErrorAlert(e.message))
  }, [q, category])

  const pill = (value, label) => (
    <button
      key={value}
      type="button"
      aria-pressed={category === value}
      onClick={() => setCategory(value)}
      className={`rounded-full px-4 py-1 text-sm font-medium ${
        category === value ? 'bg-blue-700 text-white' : 'bg-white text-slate-900 ring-1 ring-slate-500'
      }`}
    >
      {label}
    </button>
  )

  return (
    <main className="w-full p-6">
      <h1 className="mb-4 text-2xl font-bold">Artikel Terbaru</h1>
      <label htmlFor="search" className="block text-sm font-medium">Cari artikel</label>
      <input
        id="search"
        type="search"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        className="mb-4 mt-1 w-full max-w-md rounded-md border border-slate-500 bg-white px-3 py-2 text-slate-900"
      />
      <div role="group" aria-label="Filter kategori" className="mb-6 flex flex-wrap gap-2">
        {pill('', 'Semua')}
        {categories.map((c) => pill(c, c))}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.id} className="rounded-xl bg-white p-5 text-slate-900 shadow">
            <p className="text-xs font-semibold uppercase text-blue-800">{post.category}</p>
            <h2 className="text-lg font-semibold">
              <a
                href={`/posts/${post.slug}`}
                className="text-slate-900 underline"
                onClick={(event) => {
                  event.preventDefault()
                  navigate(`/posts/${post.slug}`)
                }}
              >
                {post.title}
              </a>
            </h2>
            <p className="my-2 text-sm">{post.excerpt}</p>
            <p className="text-xs text-slate-800">
              {formatDate(post.published_at)} &middot; {post.reading_time} menit baca
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}
