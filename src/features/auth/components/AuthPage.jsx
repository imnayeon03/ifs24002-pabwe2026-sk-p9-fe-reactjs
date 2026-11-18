import { useState } from 'react'
import useInput from '../../../hooks/useInput'
import { login, register } from '../api/authApi'
import { showErrorAlert, showSuccessAlert } from '../../../helpers/toolsHelper'

const fieldClass =
  'mt-1 block w-full rounded-md border border-slate-500 bg-white px-3 py-2 text-slate-900 focus:outline-2 focus:outline-blue-700'

// Form bersama untuk halaman login/register mandiri dan modal autentikasi
export function AuthForm({ mode, onSuccess, onSwitch }) {
  const isLogin = mode === 'login'
  const [username, onUsername] = useInput('')
  const [email, onEmail] = useInput('')
  const [password, onPassword] = useInput('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        onSuccess(await login(username, password))
      } else {
        await register(username, email, password)
        await showSuccessAlert('Akun penulis berhasil dibuat, silakan login')
        onSwitch('login')
      }
    } catch (error) {
      await showErrorAlert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="login-username" className="block text-sm font-medium">
          Username
        </label>
        <input id="login-username" className={fieldClass} value={username} onChange={onUsername} required autoComplete="username" />
      </div>
      {!isLogin && (
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium">
            Email
          </label>
          <input id="register-email" type="email" className={fieldClass} value={email} onChange={onEmail} required autoComplete="email" />
        </div>
      )}
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          className={fieldClass}
          value={password}
          onChange={onPassword}
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />
      </div>
      <button
        id="login-submit"
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {isLogin ? 'Masuk' : 'Daftar'}
      </button>
    </form>
  )
}

export default function AuthPage({ mode, onSuccess, navigate }) {
  const isLogin = mode === 'login'
  return (
    <main className="mx-auto mt-16 max-w-md rounded-xl bg-white p-8 text-slate-900 shadow dark:bg-slate-800 dark:text-slate-100">
      <h1 className="mb-6 text-2xl font-bold">{isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Baru'}</h1>
      <AuthForm
        key={mode}
        mode={mode}
        onSuccess={(user) => {
          onSuccess(user)
          navigate('/')
        }}
        onSwitch={navigate}
      />
      <p className="mt-4 text-sm">
        {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <a
          href={isLogin ? '/register' : '/login'}
          className="font-semibold text-blue-800 underline dark:text-blue-300"
          onClick={(event) => {
            event.preventDefault()
            navigate(isLogin ? '/register' : '/login')
          }}
        >
          {isLogin ? 'Daftar' : 'Masuk'}
        </a>
      </p>
    </main>
  )
}
