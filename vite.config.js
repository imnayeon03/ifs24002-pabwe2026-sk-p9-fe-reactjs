import { fileURLToPath } from 'node:url' // BARU
import { parse as babelParse } from '@babel/parser'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Menyisipkan CSS utama langsung ke index.html saat build supaya tidak ada
// permintaan stylesheet yang memblokir render (audit "Render blocking requests").
function inlineMainCss() {
  return {
    name: 'inline-main-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        return html.replace(/<link rel="stylesheet"[^>]*href="\/?([^"]+\.css)"[^>]*>/g, (tag, file) => {
          const asset = ctx.bundle && ctx.bundle[file]
          return asset ? `<style>${asset.source}</style>` : tag
        })
      },
    },
  }
}

// Cadangan untuk lingkungan Alpine (musl): parser native rollup bisa gagal dengan
// "Code is nested too deeply" sehingga vi.mock tidak di-hoist. Bila parse bawaan
// gagal, pakai @babel/parser (sudah terpasang lewat @vitejs/plugin-react).
function parseFallbackForMocks() {
  const toProgram = (code) =>
    babelParse(code, { sourceType: 'module', plugins: ['estree', 'jsx'] }).program
  return {
    name: 'parse-fallback-for-mocks',
    configResolved(config) {
      for (const plugin of config.plugins) {
        if (plugin.name !== 'vitest:mocks' || typeof plugin.transform !== 'function') continue
        const original = plugin.transform
        plugin.transform = function (code, id, options) {
          const nativeParse = this.parse
          const ctx = Object.create(this)
          ctx.parse = (source, opts) => {
            try {
              return nativeParse.call(this, source, opts)
            } catch {
              return toProgram(source)
            }
          }
          return original.call(ctx, code, id, options)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), inlineMainCss(), parseFallbackForMocks()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5174,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 900,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [fileURLToPath(new URL('./src/setupTests.js', import.meta.url))], // DIUBAH
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/setupTests.js', 'src/**/*.test.{js,jsx}'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})