// app/dashboard/absen/page.js
"use client";

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
  const [allStudents, setAllStudents] = useState([])
  const [activeTahunAjaran, setActiveTahunAjaran] = useState(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch tahun ajaran aktif terlebih dahulu
        const tahunAjaranRes = await fetch('/api/tahun-ajaran/active');
        const tahunAjaranData = await tahunAjaranRes.json();
        
        if (!tahunAjaranData.success) {
          throw new Error('Tidak ada tahun ajaran aktif');
        }
        setActiveTahunAjaran(tahunAjaranData.data);

        if (session?.user?.role === "admin") {
          // Fetch all students for admin
          const response = await fetch('/api/siswa')
          const data = await response.json()
          if (data.success) {
            setAllStudents(data.data)
          }
        } else if (session?.user?.role === "user" && session?.user?.id) {
          // Fetch current student's data
          const response = await fetch(`/api/siswa/${session.user.id}`)
          const data = await response.json()
          if (data.success) {
            setStudentData(data.data)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Gagal mengambil data',
        })
      }
    }

    if (session) {
      fetchInitialData()
    }
  }, [session])

  const handleAbsen = async (mapel) => {
    try {
      if (!activeTahunAjaran) {
        throw new Error("Tahun ajaran aktif tidak ditemukan");
      }

      setLoading(true)

      if (session?.user?.role === "user") {
        // User (student) flow
        if (!studentData) {
          throw new Error("Data siswa tidak ditemukan")
        }

        const { value: keteranganValue } = await MySwal.fire({
          title: `Absensi ${mapel}`,
          input: 'select',
          inputOptions: {
            'HADIR': 'Hadir',
            'SAKIT': 'Sakit',
            'IZIN': 'Izin',
            'ALPA': 'Alpa'
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
          siswaId: studentData._id,
          tanggal: new Date().toISOString(),
          kelas: studentData.kelas,
          keterangan: keteranganValue,
          mataPelajaran: mapel,
          semester: activeTahunAjaran.semester,
          tahunAjaran: activeTahunAjaran.tahunAjaran
        }

        await submitAbsensi(formData)

      } else {
        // Admin flow
        const { value: selectedStudentId } = await MySwal.fire({
          title: `Pilih Siswa untuk ${mapel}`,
          input: 'select',
          inputOptions: allStudents.reduce((acc, student) => {
            acc[student._id] = `${student.nama} - Kelas ${student.kelas}`
            return acc
          }, {}),
          inputPlaceholder: 'Pilih Siswa',
          showCancelButton: true,
          confirmButtonText: 'Lanjut',
          cancelButtonText: 'Batal'
        })

        if (!selectedStudentId) {
          setLoading(false)
          return
        }

        const selectedStudent = allStudents.find(s => s._id === selectedStudentId)

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

        const { value: keteranganValue } = await MySwal.fire({
          title: `Pilih Keterangan`,
          input: 'select',
          inputOptions: {
            'HADIR': 'Hadir',
            'SAKIT': 'Sakit',
            'IZIN': 'Izin',
            'ALPA': 'Alpa'
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
          siswaId: selectedStudentId,
          tanggal: new Date(tanggalValue).toISOString(),
          kelas: selectedStudent.kelas,
          keterangan: keteranganValue,
          mataPelajaran: mapel,
          semester: activeTahunAjaran.semester,
          tahunAjaran: activeTahunAjaran.tahunAjaran
        }

        await submitAbsensi(formData)
      }

      router.refresh()
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

  const submitAbsensi = async (formData) => {
    const response = await fetch('/api/absen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    const data = await response.json()
    console.log('Form Data:', formData)
    if (!data.success) {
      throw new Error(data.error || 'Gagal mengirim absensi')
    }

    await MySwal.fire({
      title: 'Berhasil!',
      text: 'Absensi berhasil terkirim',
      icon: 'success',
      confirmButtonText: 'OK'
    })
  }

  const renderStudentInfo = () => {
    if (session?.user?.role === "user" && studentData) {
      return (
        <div className={styles.studentInfo}>
          <h2>Informasi Siswa</h2>
          <p>Nama: {studentData.nama}</p>
          <p>NISN: {studentData.nisn}</p>
          <p>Kelas: {studentData.kelas}</p>
          {activeTahunAjaran && (
            <p>Tahun Ajaran: {activeTahunAjaran.tahunAjaran} - Semester {activeTahunAjaran.semester}</p>
          )}
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

  if (!activeTahunAjaran) {
    return (
      <div className={styles.unauthorized}>
        Tidak ada tahun ajaran aktif
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