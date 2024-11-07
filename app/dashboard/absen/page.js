// app/dashboard/absen/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import styles from '@/app/ui/dashboard/absen/absen.module.css'

const MySwal = withReactContent(Swal)

const mataPelajaran = [
  'MATEMATIKA', 'IPA', 'IPS', 'BAHASA INDONESIA', 'BAHASA INGGRIS',
  'BAHASA JEPANG', 'AGAMA', 'PKN', 'PJOK', 'MULOK', 'PRAKARYA',
  'INFORMATIKA', 'SENI', 'PROJECT P5'
]

export default function Absen() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [studentData, setStudentData] = useState(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      if (session?.user?.role === "user" && session?.user?.id) {
        try {
          const response = await fetch(`/api/siswa/${session.user.id}`)
          const data = await response.json()
          if (data.success) {
            setStudentData(data.data)
          } else {
            MySwal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Gagal mengambil data siswa',
            })
          }
        } catch (error) {
          console.error("Error fetching student data:", error)
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal mengambil data siswa',
          })
        }
      }
    }

    fetchStudentData()
  }, [session])

  const handleAbsen = async (mapel) => {
    try {
      setLoading(true)

      // Jika user biasa, gunakan data siswa yang sudah login
      if (session?.user?.role === "user") {
        if (!studentData) {
          throw new Error("Data siswa tidak ditemukan")
        }

        const { value: keteranganValue } = await MySwal.fire({
          title: `Absensi ${mapel}`,
          input: 'select',
          inputOptions: {
            Hadir: 'Hadir',
            'Tidak Hadir': 'Tidak Hadir',
            Terlambat: 'Terlambat'
          },
          inputPlaceholder: 'Pilih Keterangan',
          showCancelButton: true,
          confirmButtonText: 'Submit',
          cancelButtonText: 'Batal'
        })

        if (!keteranganValue) {
          setLoading(false)
          return
        }

        const formData = {
          nama: studentData.nama,
          tanggal: new Date().toISOString().split('T')[0],
          kelas: studentData.kelas,
          keterangan: keteranganValue,
          mataPelajaran: mapel
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

        await MySwal.fire({
          title: 'Berhasil!',
          text: 'Absensi berhasil terkirim',
          icon: 'success',
          confirmButtonText: 'OK'
        })

      } else {
        // Untuk admin, gunakan flow yang sudah ada
        const { value: namaValue } = await MySwal.fire({
          title: `Absensi ${mapel}`,
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
          mataPelajaran: mapel
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

        await MySwal.fire({
          title: 'Berhasil!',
          text: 'Absensi berhasil terkirim',
          icon: 'success',
          confirmButtonText: 'OK'
        })
      }

      router.push('/dashboard/absen')
    } catch (error) {
      console.error('Error:', error)
      await MySwal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengirim absensi',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setLoading(false)
    }
  }

  // Tampilkan informasi siswa jika user biasa
  const renderStudentInfo = () => {
    if (session?.user?.role === "user" && studentData) {
      return (
        <div className={styles.studentInfo}>
          <h2>Informasi Siswa</h2>
          <p>Nama: {studentData.nama}</p>
          <p>NISN: {studentData.nisn}</p>
          <p>Kelas: {studentData.kelas}</p>
        </div>
      )
    }
    return null
  }

  if (!session) {
    return (
      <div className={styles.unauthorized}>
        Anda harus login terlebih dahulu
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {renderStudentInfo()}
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