const CARDS = [
  { key: 'total', label: 'Total Artikel', cls: 'bg-blue-700' },
  { key: 'total_terbit', label: 'Total Terbit', cls: 'bg-emerald-800' },
  { key: 'belum_selesai', label: 'Belum Selesai (Draf)', cls: 'bg-amber-800' },
]

export default function PostStats({ stats }) {
  return (
    <section aria-label="Ringkasan statistik artikel" className="grid gap-4 sm:grid-cols-3">
      {CARDS.map((card) => (
        <div key={card.key} className={`${card.cls} rounded-xl p-5 text-white shadow`}>
          <p className="text-sm font-medium">{card.label}</p>
          <p className="text-3xl font-bold">{stats[card.key]}</p>
        </div>
      ))}
    </section>
  )
}
