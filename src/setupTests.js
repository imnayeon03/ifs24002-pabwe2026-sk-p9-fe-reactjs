import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Polyfill JSDOM yang dibutuhkan Toast UI Editor
HTMLCanvasElement.prototype.getContext = () => null
window.matchMedia =
  window.matchMedia ||
  (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
document.getSelection = document.getSelection || (() => ({ removeAllRanges() {}, addRange() {} }))

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})
