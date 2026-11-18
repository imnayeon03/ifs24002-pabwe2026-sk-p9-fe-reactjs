import Swal from 'sweetalert2'

export const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const showSuccessAlert = (message) =>
  Swal.fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1800, showConfirmButton: false })

export const showErrorAlert = (message) => Swal.fire({ icon: 'error', title: 'Gagal', text: message })

export const showConfirmDialog = async (title, text) => {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
  })
  return result.isConfirmed
}
