import { useState } from 'react'
import { AuthForm } from '../components/AuthPage'

// Modal popup autentikasi (id wajib: login-username, login-password, login-submit)
export default function AuthModal({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('login')
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md overflow-hidden rounded-xl bg-white text-slate-900"
      >
        <div className="bg-blue-700 px-6 py-4 text-white">
          <h2 id="auth-modal-title" className="text-lg font-bold">
            {mode === 'login' ? 'Masuk' : 'Daftar'}
          </h2>
        </div>
        <div className="p-6">
          <AuthForm key={mode} mode={mode} onSuccess={onSuccess} onSwitch={setMode} />
        </div>
        <div className="flex justify-end gap-2 bg-slate-200 px-6 py-3">
          <button
            type="button"
            className="rounded-md bg-white px-4 py-2 font-medium text-slate-900 ring-1 ring-slate-500"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Buat akun' : 'Sudah punya akun'}
          </button>
          <button type="button" className="rounded-md bg-slate-800 px-4 py-2 font-medium text-white" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
