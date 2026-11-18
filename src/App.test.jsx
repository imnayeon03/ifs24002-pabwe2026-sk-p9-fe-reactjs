import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./features/auth/api/authApi', () => ({ logout: vi.fn(), login: vi.fn(), register: vi.fn() }))
vi.mock('./features/blog/components/PublicArticleList', () => ({ default: ({ navigate }) => <div>BERANDA<button onClick={() => navigate('/posts/x')}>buka</button></div> }))
vi.mock('./features/blog/components/PublicArticleDetail', () => ({ default: ({ slug }) => <div>DETAIL-{slug}</div> }))
vi.mock('./features/blog/components/AuthorDashboard', () => ({ default: () => <div>RUANG-PENULIS</div> }))
vi.mock('./features/admin/components/AdminDashboard', () => ({ default: () => <div>PANEL-ADMIN</div> }))
import { logout } from './features/auth/api/authApi'
import App from './App'
import { expectNoAxeViolations } from './test/axe'

const member = { username: 'member', role: 'member' }
const admin = { username: 'admin', role: 'admin' }
const go = (path, user) => {
  window.history.replaceState({}, '', path)
  if (user) localStorage.setItem('user', JSON.stringify(user))
  return render(<App />)
}

beforeEach(() => {
  logout.mockReset()
})

describe('App routing', () => {
  it('beranda publik, tanpa pelanggaran axe', async () => {
    const { container } = go('/')
    expect(screen.getByText('BERANDA')).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })
  it('/login dan /register', () => {
    const { unmount } = go('/login')
    expect(screen.getByRole('heading', { name: /Masuk ke Delcom Blog/ })).toBeInTheDocument()
    unmount()
    go('/register')
    expect(screen.getByRole('heading', { name: /Daftar Akun Baru/ })).toBeInTheDocument()
  })
  it('detail artikel', () => {
    go('/posts/halo-dunia')
    expect(screen.getByText('DETAIL-halo-dunia')).toBeInTheDocument()
  })
  it('/author butuh login', () => {
    const { unmount } = go('/author')
    expect(screen.getByText('BERANDA')).toBeInTheDocument()
    unmount()
    go('/author', member)
    expect(screen.getByText('RUANG-PENULIS')).toBeInTheDocument()
  })
  it('/admin hanya untuk admin', () => {
    const { unmount } = go('/admin', member)
    expect(screen.getByText('BERANDA')).toBeInTheDocument()
    unmount()
    go('/admin', admin)
    expect(screen.getByText('PANEL-ADMIN')).toBeInTheDocument()
  })
  it('navigasi dan popstate', async () => {
    go('/')
    await userEvent.click(screen.getByRole('button', { name: 'buka' }))
    expect(window.location.pathname).toBe('/posts/x')
    expect(screen.getByText('DETAIL-x')).toBeInTheDocument()
    act(() => {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByText('BERANDA')).toBeInTheDocument()
  })
  it('logout sukses dan gagal', async () => {
    logout.mockResolvedValue()
    const { unmount } = go('/author', member)
    await userEvent.click(screen.getByRole('button', { name: /Keluar/ }))
    await waitFor(() => expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument())
    unmount()
    logout.mockImplementation(() => Promise.reject(new Error('x')))
    localStorage.setItem('token', 'T')
    go('/author', member)
    await userEvent.click(screen.getByRole('button', { name: /Keluar/ }))
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
  })
})
