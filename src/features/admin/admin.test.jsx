import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

vi.mock('./api/adminApi')
vi.mock('../../helpers/toolsHelper', () => ({ showErrorAlert: vi.fn().mockResolvedValue() }))
import * as admin from './api/adminApi'
import { showErrorAlert } from '../../helpers/toolsHelper'
import AdminDashboard from './components/AdminDashboard'
import { expectNoAxeViolations } from '../../test/axe'

beforeEach(() => {
  showErrorAlert.mockClear()
  admin.listUsers.mockReset().mockResolvedValue([{ id: 1, username: 'budi', email: 'b@x.id', role: 'member', total_posts: 2, total_published: 1 }])
  admin.listAllPosts.mockReset().mockResolvedValue([
    { id: 1, title: 'A', author: { username: 'budi' }, category: 'Umum', is_published: true },
    { id: 2, title: 'B', category: 'Umum', is_published: false },
  ])
})

describe('AdminDashboard', () => {
  it('menampilkan pengguna & artikel, tanpa pelanggaran axe', async () => {
    const { container } = render(<AdminDashboard />)
    expect(await screen.findByText('Terbit')).toBeInTheDocument()
    expect(screen.getByText('Draf')).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })
  it('error memuat', async () => {
    admin.listUsers.mockRejectedValue(new Error('gagal'))
    render(<AdminDashboard />)
    await waitFor(() => expect(showErrorAlert).toHaveBeenCalledWith('gagal'))
  })
})
