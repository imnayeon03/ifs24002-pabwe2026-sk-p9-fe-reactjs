import { useEffect, useState } from 'react'

const ACCENTS = { biru: '#1d4ed8', hijau: '#047857', ungu: '#6d28d9' }

// Hook tema light/dark serta pilihan aksen warna
export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [accent, setAccent] = useState(() => localStorage.getItem('accent') || 'biru')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', ACCENTS[accent])
    localStorage.setItem('accent', accent)
  }, [accent])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return { theme, toggleTheme, accent, setAccent, accents: Object.keys(ACCENTS) }
}
