import { useCallback, useEffect, useState } from 'react'
import { clearSession, getUser } from './helpers/apiHelper'
import { logout } from './features/auth/api/authApi'
import AuthPage from './features/auth/components/AuthPage'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import AdminDashboard from './features/admin/components/AdminDashboard'

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  const doLogout = async () => {
    try {
      await logout()
    } catch {
      clearSession()
    }
    setUser(null)
    navigate('/')
  }

  const detail = path.match(/^\/posts\/([^/]+)$/)
  let page
  if (path === '/login' || path === '/register') {
    page = <AuthPage mode={path.slice(1)} onSuccess={setUser} navigate={navigate} />
  } else if (detail) {
    page = <PublicArticleDetail slug={detail[1]} navigate={navigate} />
  } else if (path === '/author' && user) {
    page = <AuthorDashboard navigate={navigate} />
  } else if (path === '/admin' && user?.role === 'admin') {
    page = <AdminDashboard />
  } else {
    page = <PublicArticleList navigate={navigate} />
  }

  return (
    <>
      <StickyNavbar user={user} navigate={navigate} onLogout={doLogout} />
      {page}
    </>
  )
}
