import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../helpers/apiHelper', async (orig) => ({ ...(await orig()), apiRequest: vi.fn() }))
import { apiRequest, getToken } from '../helpers/apiHelper'
import * as auth from './auth/api/authApi'
import * as blog from './blog/api/blogApi'
import * as admin from './admin/api/adminApi'

beforeEach(() => {
  apiRequest.mockReset().mockResolvedValue({ data: 'D' })
})

describe('authApi', () => {
  it('login menyimpan sesi', async () => {
    apiRequest.mockResolvedValue({ data: { token: 'T', user: { username: 'u' } } })
    expect(await auth.login('u', 'p')).toEqual({ username: 'u' })
    expect(getToken()).toBe('T')
  })
  it('register, profil, update profil', async () => {
    expect(await auth.register('u', 'e', 'p')).toBe('D')
    expect(await auth.getProfile()).toBe('D')
    expect(await auth.updateProfile({ a: 1 })).toBe('D')
  })
  it('logout selalu menghapus sesi, juga saat error', async () => {
    localStorage.setItem('token', 'T')
    await auth.logout()
    expect(getToken()).toBeNull()
    localStorage.setItem('token', 'T')
    apiRequest.mockImplementation(() => Promise.reject(new Error('x')))
    const outcome = await auth.logout().then(() => 'ok', (e) => e.message)
    expect(outcome).toBe('x')
    expect(getToken()).toBeNull()
  })
})

describe('blogApi', () => {
  it('endpoint publik dengan dan tanpa filter', async () => {
    expect(await blog.listCategories()).toBe('D')
    await blog.listPublicPosts()
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts')
    await blog.listPublicPosts('go', 'Teknologi')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts?q=go&category=Teknologi')
    await blog.listPublicPosts('', '')
    expect(apiRequest).toHaveBeenLastCalledWith('/api/public/posts')
    expect(await blog.getPublicPost('a-b')).toBe('D')
  })
  it('endpoint penulis', async () => {
    expect(await blog.listMyPosts()).toBe('D')
    expect(await blog.getPostStats()).toBe('D')
    expect(await blog.createPost({})).toBe('D')
    expect(await blog.updatePost(1, {})).toBe('D')
    expect(await blog.togglePublish(1)).toBe('D')
    await blog.deletePost(1)
    expect(apiRequest).toHaveBeenLastCalledWith('/api/posts/1', { method: 'DELETE' })
    expect(await blog.aiGeneratePost('t', 'Umum', true)).toBe('D')
    expect(JSON.parse(apiRequest.mock.calls.at(-1)[1].body)).toEqual({ topic: 't', category: 'Umum', include_web_search: true })
  })
})

describe('adminApi', () => {
  it('memanggil endpoint', async () => {
    expect(await admin.listUsers()).toBe('D')
    expect(await admin.listAllPosts()).toBe('D')
  })
})
