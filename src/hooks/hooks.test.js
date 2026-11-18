import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useInput from './useInput'
import useTheme from './useTheme'

describe('useInput', () => {
  it('mengikat nilai dua arah dan reset', () => {
    const { result } = renderHook(() => useInput('a'))
    act(() => result.current[1]({ target: { value: 'b' } }))
    expect(result.current[0]).toBe('b')
    act(() => result.current[2]())
    expect(result.current[0]).toBe('a')
  })
})

describe('useTheme', () => {
  it('default terang lalu toggle gelap dan ganti aksen', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
    act(() => result.current.setAccent('hijau'))
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#047857')
  })

  it('membaca preferensi tersimpan', () => {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('accent', 'ungu')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(result.current.accent).toBe('ungu')
  })
})
