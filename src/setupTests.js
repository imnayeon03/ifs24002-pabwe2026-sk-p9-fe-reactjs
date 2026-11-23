import '@testing-library/jest-dom/vitest'
import React from 'react'
import { afterEach, beforeEach, vi } from 'vitest'

globalThis.React = React
globalThis.h = React.createElement

vi.mock('@tabler/icons-react', () => {
  const make = (name) => (props) => globalThis.h('svg', { 'data-icon': name, ...props })
  return {
    IconDotsVertical: make('dots'),
    IconMoon: make('moon'),
    IconPlus: make('plus'),
    IconSparkles: make('sparkles'),
    IconSun: make('sun'),
  }
})

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}))

beforeEach(() => {
  window.scrollTo = vi.fn()
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  vi.clearAllMocks()
})
