import { useEffect, useState } from 'react'
import { listAllPosts, listUsers } from '../api/adminApi'
import { showErrorAlert } from '../../../helpers/toolsHelper'

// Panel admin full width: direktori pengguna + arsip seluruh artikel
export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    Promise.all([listUsers(), listAllPosts()])
      .then(([u, p]) => {
        setUsers(u)
        setPosts(p)
      })
      .catch((e) => showErrorAlert(e.message))
  }, [])

  return (
    <main className="w-full space-y-8 p-6">
      <h1 className="text-2xl font-bold">Panel Admin</h1>
      <section aria-labelledby="users-title">
        <h2 id="users-title" className="mb-2 text-lg font-semibold">Direktori Pengguna</h2>
        <div className="overflow-x-auto rounded-xl bg-white text-slate-900 shadow">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Daftar pengguna</caption>
            <thead className="bg-blue-100">
              <tr>
                <th scope="col" className="px-4 py-3">ID</th>
                <th scope="col" className="px-4 py-3">Username</th>
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3">Total Artikel</th>
                <th scope="col" className="px-4 py-3">Total Terbit</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-300">
                  <td className="px-4 py-3">{u.id}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.total_posts}</td>
                  <td className="px-4 py-3">{u.total_published}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="posts-title">
        <h2 id="posts-title" className="mb-2 text-lg font-semibold">Arsip Seluruh Artikel</h2>
        <div className="overflow-x-auto rounded-xl bg-white text-slate-900 shadow">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Daftar seluruh artikel</caption>
            <thead className="bg-blue-100">
              <tr>
                <th scope="col" className="px-4 py-3">Judul</th>
                <th scope="col" className="px-4 py-3">Penulis</th>
                <th scope="col" className="px-4 py-3">Kategori</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-slate-300">
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3">{p.author?.username}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.is_published ? 'Terbit' : 'Draf'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
