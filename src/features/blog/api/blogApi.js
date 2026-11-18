import { apiRequest } from '../../../helpers/apiHelper'

const json = (method, payload) => ({ method, body: JSON.stringify(payload) })

// Publik
export const listCategories = async () => (await apiRequest('/api/public/categories')).data
export const listPublicPosts = async (q = '', category = '') => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const qs = params.toString()
  return (await apiRequest(qs ? `/api/public/posts?${qs}` : '/api/public/posts')).data
}
export const getPublicPost = async (slug) => (await apiRequest(`/api/public/posts/${slug}`)).data

// Penulis
export const listMyPosts = async () => (await apiRequest('/api/posts')).data
export const getPostStats = async () => (await apiRequest('/api/posts/stats')).data
export const createPost = async (payload) => (await apiRequest('/api/posts', json('POST', payload))).data
export const updatePost = async (id, payload) => (await apiRequest(`/api/posts/${id}`, json('PUT', payload))).data
export const togglePublish = async (id) => (await apiRequest(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' })).data
export const deletePost = async (id) => apiRequest(`/api/posts/${id}`, { method: 'DELETE' })
export const aiGeneratePost = async (topic, category, includeWebSearch) =>
  (await apiRequest('/api/posts/ai-generate', json('POST', { topic, category, include_web_search: includeWebSearch }))).data
