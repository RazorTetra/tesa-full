'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import styles from '@/app/ui/dashboard/absen/absen.module.css'

const MySwal = withReactContent(Swal)

const mataPelajaran = [
  'MATEMATIKA', 'IPA', 'IPS', 'BAHASA INDONESIA', 'BAHASA INGGRIS',
  'BAHASA JEPANG', 'AGAMA',   'PKN', 'PJOK', 'MULOK', 'PRAKARYA',
  'INFORMATIKA', 'SENI', 'PROJECT P5'
]

export default function Absen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAbsen = async (nama) => {
    try {
      setLoading(true)

      const { value: namaValue } = await MySwal.fire({
        title: `Absensi ${nama}`,
        input: 'text',
        inputLabel: 'Nama',
        inputPlaceholder: 'Masukkan nama',
        showCancelButton: true,
        confirmButtonText: 'Lanjut',
        cancelButtonText: 'Batal'
      })
      if (!namaValue) {
        setLoading(false)
        return
      }

      const { value: tanggalValue } = await MySwal.fire({
        title: `Tanggal Absensi`,
        input: 'date',
        inputLabel: 'Tanggal',
        inputPlaceholder: 'Pilih tanggal',
        showCancelButton: true,
        confirmButtonText: 'Lanjut',
        cancelButtonText: 'Batal'
      })
      if (!tanggalValue) {
        setLoading(false)
        return
      }

      const { value: kelasValue } = await MySwal.fire({
        title: `Pilih Kelas`,
        input: 'select',
        inputOptions: {
          VII: 'VII',
          VIII: 'VIII',
          IX: 'IX'
        },
        inputPlaceholder: 'Pilih Kelas',
        showCancelButton: true,
        confirmButtonText: 'Lanjut',
        cancelButtonText: 'Batal'
      })
      if (!kelasValue) {
        setLoading(false)
        return
      }

      const { value: keteranganValue } = await MySwal.fire({
        title: `Pilih Keterangan`,
        input: 'select',
        inputOptions: {
          Hadir: 'Hadir',
          'Tidak Hadir': 'Tidak Hadir',
          Terlambat: 'Terlambat'
        },
        inputPlaceholder: 'Pilih Keterangan',
        showCancelButton: true,
        confirmButtonText: 'Lanjut',
        cancelButtonText: 'Batal'
      })
      if (!keteranganValue) {
        setLoading(false)
        return
      }

      const formData = {
        nama: namaValue,
        tanggal: tanggalValue,
        kelas: kelasValue,
        keterangan: keteranganValue,
        mataPelajaran: nama
      }

      const response = await fetch('/api/absen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log('Data absensi terkirim:', data)
      
      await MySwal.fire({
        title: 'Berhasil!',
        text: 'Absensi berhasil terkirim',
        icon: 'success',
        confirmButtonText: 'OK'
      })

      router.push('/dashboard/absen')
    } catch (error) {
      console.error('Error:', error)
      await MySwal.fire({
        title: 'Error!',
        text: 'Gagal mengirim absensi',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.gridMataPelajaran}>
        {mataPelajaran.map((nama) => (
          <button
            key={nama}
            className={styles.kartuMataPelajaran}
            onClick={() => handleAbsen(nama)}
            disabled={loading}
          >
            {nama}
          </button>
        ))}
      </div>
    </div>
  )
}