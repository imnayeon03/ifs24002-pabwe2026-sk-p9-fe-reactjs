import { describe, it, expect, vi } from 'vitest'
import Swal from 'sweetalert2'
import { apiRequest, clearSession, getToken, getUser, saveSession } from './apiHelper'
import { formatDate, showConfirmDialog, showErrorAlert, showSuccessAlert } from './toolsHelper'

const mockFetch = (ok, body, jsonFails = false) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok, json: () => (jsonFails ? Promise.reject(new Error('x')) : Promise.resolve(body)) }),
  )

describe('apiHelper', () => {
  it('menyimpan, membaca, dan menghapus sesi', () => {
    expect(getUser()).toBeNull()
    saveSession('tok', { username: 'a' })
    expect(getToken()).toBe('tok')
    expect(getUser()).toEqual({ username: 'a' })
    clearSession()
    expect(getToken()).toBeNull()
  })

  it('mengirim Bearer token dan header tambahan', async () => {
    saveSession('tok', {})
    mockFetch(true, { status: 'success', data: 1 })
    const body = await apiRequest('/x', { headers: { 'X-A': '1' } })
    expect(body.data).toBe(1)
    expect(fetch.mock.calls[0][1].headers).toMatchObject({ Authorization: 'Bearer tok', 'X-A': '1' })
  })

  it('tanpa token dan tanpa header tambahan', async () => {
    mockFetch(true, { status: 'success' })
    await apiRequest('/x')
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('melempar pesan server saat gagal', async () => {
    mockFetch(false, { status: 'fail', message: 'Ditolak' })
    await expect(apiRequest('/x')).rejects.toThrow('Ditolak')
  })

  it('pesan default bila server tidak memberi pesan', async () => {
    mockFetch(false, { status: 'fail' })
    await expect(apiRequest('/x')).rejects.toThrow('Terjadi kesalahan')
  })

  it('menangani respons non-JSON', async () => {
    mockFetch(true, null, true)
    await expect(apiRequest('/x')).rejects.toThrow('Respons server tidak valid')
  })
})

describe('toolsHelper', () => {
  it('formatDate', () => {
    expect(formatDate('')).toBe('-')
    expect(formatDate('2026-11-18')).toMatch(/2026/)
  })

  it('alert sukses dan error', async () => {
    const fire = vi.spyOn(Swal, 'fire').mockResolvedValue({})
    await showSuccessAlert('ok')
    await showErrorAlert('bad')
    expect(fire).toHaveBeenCalledTimes(2)
  })

  it('dialog konfirmasi', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValueOnce({ isConfirmed: true }).mockResolvedValueOnce({ isConfirmed: false })
    expect(await showConfirmDialog('t', 'x')).toBe(true)
    expect(await showConfirmDialog('t', 'x')).toBe(false)
  })
})
