import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('./api/authApi', () => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('../../helpers/toolsHelper', () => ({
  showErrorAlert: vi.fn().mockResolvedValue(),
  showSuccessAlert: vi.fn().mockResolvedValue(),
}))
import { login, register } from './api/authApi'
import { showErrorAlert } from '../../helpers/toolsHelper'
import AuthPage from './components/AuthPage'
import AuthModal from './modals/AuthModal'
import { expectNoAxeViolations } from '../../test/axe'

beforeEach(() => {
  login.mockReset()
  register.mockReset()
})

describe('AuthPage', () => {
  it('login sukses lalu navigasi ke /', async () => {
    login.mockResolvedValue({ username: 'u' })
    const onSuccess = vi.fn()
    const navigate = vi.fn()
    render(<AuthPage mode="login" onSuccess={onSuccess} navigate={navigate} />)
    await userEvent.type(document.getElementById('login-username'), 'u')
    await userEvent.type(document.getElementById('login-password'), 'p')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'))
    expect(onSuccess).toHaveBeenCalledWith({ username: 'u' })
  })

  it('login gagal menampilkan alert error', async () => {
    login.mockRejectedValue(new Error('salah'))
    render(<AuthPage mode="login" onSuccess={vi.fn()} navigate={vi.fn()} />)
    await userEvent.type(document.getElementById('login-username'), 'u')
    await userEvent.type(document.getElementById('login-password'), 'p')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('salah'))
  })

  it('register sukses mengarah ke login', async () => {
    register.mockResolvedValue({})
    const navigate = vi.fn()
    render(<AuthPage mode="register" onSuccess={vi.fn()} navigate={navigate} />)
    await userEvent.type(document.getElementById('login-username'), 'u')
    await userEvent.type(document.getElementById('register-email'), 'u@x.id')
    await userEvent.type(document.getElementById('login-password'), 'p')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('login'))
  })

  it('tautan pindah mode', async () => {
    const navigate = vi.fn()
    const { rerender } = render(<AuthPage mode="login" onSuccess={vi.fn()} navigate={navigate} />)
    await userEvent.click(screen.getByRole('link', { name: 'Daftar' }))
    expect(navigate).toHaveBeenCalledWith('/register')
    rerender(<AuthPage mode="register" onSuccess={vi.fn()} navigate={navigate} />)
    await userEvent.click(screen.getByRole('link', { name: 'Masuk' }))
    expect(navigate).toHaveBeenCalledWith('/login')
  })

  it('tanpa pelanggaran axe (login & register)', async () => {
    const { container, rerender } = render(<AuthPage mode="login" onSuccess={vi.fn()} navigate={vi.fn()} />)
    await expectNoAxeViolations(container)
    rerender(<AuthPage mode="register" onSuccess={vi.fn()} navigate={vi.fn()} />)
    await expectNoAxeViolations(container)
  })
})

describe('AuthModal', () => {
  it('tertutup tidak merender apa pun', () => {
    const { container } = render(<AuthModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('login, ganti mode, dan tutup', async () => {
    login.mockResolvedValue({ username: 'u' })
    const onSuccess = vi.fn()
    const onClose = vi.fn()
    render(<AuthModal open onClose={onClose} onSuccess={onSuccess} />)
    await userEvent.type(document.getElementById('login-username'), 'u')
    await userEvent.type(document.getElementById('login-password'), 'p')
    await userEvent.click(document.getElementById('login-submit'))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    await userEvent.click(screen.getByRole('button', { name: 'Buat akun' }))
    expect(screen.getByRole('heading', { name: 'Daftar' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sudah punya akun' }))
    expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('tanpa pelanggaran axe', async () => {
    const { container } = render(<AuthModal open onClose={vi.fn()} onSuccess={vi.fn()} />)
    await expectNoAxeViolations(container)
  })
})
