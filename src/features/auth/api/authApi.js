import { apiRequest, saveSession, clearSession } from '../../../helpers/apiHelper'

export async function login(username, password) {
  const body = await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
  saveSession(body.data.token, body.data.user)
  return body.data.user
}

export async function register(username, email, password) {
  const body = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
  return body.data
}

export async function logout() {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' })
  } finally {
    clearSession()
  }
}

export async function getProfile() {
  return (await apiRequest('/api/auth/profile')).data
}

export async function updateProfile(payload) {
  return (await apiRequest('/api/auth/profile', { method: 'PUT', body: JSON.stringify(payload) })).data
}
