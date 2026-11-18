import { useEffect, useState } from 'react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { getPublicPost } from '../api/blogApi'
import { formatDate } from '../../../helpers/toolsHelper'

// Halaman baca artikel (full width)
export default function PublicArticleDetail({ slug, navigate }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicPost(slug).then(setPost).catch((e) => setError(e.message))
  }, [slug])

  return (
    <main className="w-full bg-white p-8 text-slate-900">
      <button type="button" className="mb-4 font-semibold text-blue-800 underline" onClick={() => navigate('/')}>
        &larr; Kembali ke beranda
      </button>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      {!post && !error && <p>Memuat...</p>}
      {post && (
        <article>
          <p className="text-sm font-semibold uppercase text-blue-800">{post.category}</p>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="my-2 text-sm">
            Oleh {post.author?.username} &middot; {formatDate(post.published_at)} &middot; {post.reading_time} menit baca
          </p>
          {post.cover_image_path && <img src={post.cover_image_path} alt={`Sampul ${post.title}`} className="my-4 max-h-96 w-full rounded-lg object-cover" />}
          <MarkdownViewer value={post.content} />
        </article>
      )}
    </main>
  )
}
