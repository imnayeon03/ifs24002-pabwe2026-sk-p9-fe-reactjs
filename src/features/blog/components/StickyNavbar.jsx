// Navbar sticky untuk halaman publik dan area penulis (tanpa sidebar)
export default function StickyNavbar({ user, navigate, onLogout }) {
  const link = (to, label) => (
    <a
      href={to}
      className="rounded px-3 py-2 font-medium hover:bg-blue-800"
      onClick={(event) => {
        event.preventDefault()
        navigate(to)
      }}
    >
      {label}
    </a>
  )
  return (
    <header className="sticky top-0 z-40 bg-blue-700 text-white shadow">
      <nav aria-label="Navigasi utama" className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-2">
        <span className="text-lg font-bold">Delcom Blog</span>
        <div className="flex flex-wrap items-center gap-1">
          {link('/', 'Beranda')}
          {user && link('/author', 'Ruang Penulis')}
          {user?.role === 'admin' && link('/admin', 'Admin')}
          {user ? (
            <button type="button" className="rounded px-3 py-2 hover:bg-blue-800" onClick={onLogout}>
              Keluar ({user.username})
            </button>
          ) : (
            <>
              {link('/login', 'Login')}
              {link('/register', 'Register')}
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
