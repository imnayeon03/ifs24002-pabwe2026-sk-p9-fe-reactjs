import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import { aiGeneratePost } from '../api/blogApi'
import { showErrorAlert } from '../../../helpers/toolsHelper'

// Modal layar penuh AI Blog Generator, dengan opsi penelusuran Search Engine
export default function AiPostGeneratorModal({ open, categories, onClose, onApply }) {
  const [topic, onTopic] = useInput('')
  const [category, onCategory] = useInput('Umum')
  const [useSearch, setUseSearch] = useState(true)
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(false)
  if (!open) return null

  const generate = async () => {
    setLoading(true)
    try {
      setDraft(await aiGeneratePost(topic, category, useSearch))
    } catch (error) {
      await showErrorAlert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-post-title"
        className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white text-slate-900"
      >
        <header className="bg-violet-800 px-6 py-4 text-white">
          <h2 id="ai-post-title" className="text-xl font-bold">AI Blog Generator</h2>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div>
            <label htmlFor="ai-topic" className="text-sm font-medium">Topik artikel</label>
            <input id="ai-topic" value={topic} onChange={onTopic} className="mt-1 block w-full rounded-md border border-slate-500 bg-white px-3 py-2" />
          </div>
          <div>
            <label htmlFor="ai-category" className="text-sm font-medium">Kategori</label>
            <select id="ai-category" value={category} onChange={onCategory} className="mt-1 block rounded-md border border-slate-500 bg-white px-3 py-2">
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="ai-search" type="checkbox" checked={useSearch} onChange={(event) => setUseSearch(event.target.checked)} />
            <label htmlFor="ai-search" className="text-sm">Sertakan penelusuran Search Engine</label>
          </div>
          <button
            type="button"
            disabled={loading || !topic.trim()}
            onClick={generate}
            className="rounded-md bg-violet-800 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Hasilkan Artikel'}
          </button>
          {draft && (
            <section aria-label="Pratinjau draf" className="space-y-2 rounded-lg border border-slate-400 p-4">
              <h3 className="text-lg font-bold">{draft.title}</h3>
              <p>{draft.excerpt}</p>
              <h4 className="font-semibold">Sumber Rujukan Mesin Pencari</h4>
              <ul className="list-disc pl-6">
                {(draft.sources || []).map((s) => (
                  <li key={s.url}>
                    <a href={s.url} className="text-blue-800 underline">{s.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <footer className="flex justify-end gap-2 bg-slate-200 px-6 py-3">
          <button type="button" className="rounded-md bg-white px-4 py-2 font-medium ring-1 ring-slate-500" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            disabled={!draft}
            className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
            onClick={() => onApply(draft)}
          >
            Terapkan ke Editor
          </button>
        </footer>
      </div>
    </div>
  )
}
