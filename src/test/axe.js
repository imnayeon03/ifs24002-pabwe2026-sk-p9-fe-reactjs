import axe from 'axe-core'

// color-contrast tidak dapat dihitung di JSDOM, jadi dinonaktifkan di sini.
// Kontras warna diverifikasi lewat pemilihan palet (teks gelap/terang ber-rasio >= 4.5:1).
export async function expectNoAxeViolations(container) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node)`)
  expect(summary).toEqual([])
}
