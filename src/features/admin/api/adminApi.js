import { apiRequest } from '../../../helpers/apiHelper'

export const listUsers = async () => (await apiRequest('/api/admin/users')).data
export const listAllPosts = async () => (await apiRequest('/api/admin/posts')).data
