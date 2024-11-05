"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const cardData = [
  { title: 'Jumlah Siswa', value: 4322, change: 12,  },
  { title: 'Jumlah Guru', value: 187, change: 5,  },
  { title: 'Mutasi Masuk', value: 95, change: -2,  },
  { title: 'Mutasi Keluar', value: 56, change: 8,  },
]

const mataPelajaran = [
  'MATEMATIKA', 'IPA', 'IPS', 'BAHASA INDONESIA', 'BAHASA INGGRIS',
  'BAHASA JEPANG', 'AGAMA', 'PKN', 'PJOK', 'MULOK', 'PRAKARYA',
  'INFORMATIKA', 'SENI', 'PROJECT P5'
]

function Card({ title, value, change, isHovered }) {
  const isPositive = change >= 0

  return (
    <motion.div
      className={`p-6 rounded-2xl shadow-lg transition-all duration-300 bg-gradient-to-br ${
        isHovered ? 'from-indigo-500 to-purple-400' : 'from-indigo-950 to-slate-900'
      } backdrop-blur-md bg-opacity-60`}
      whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(79, 70, 229, 0.4)" }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>x  
      </div>
      <div className="text-4xl font-bold mb-2 text-white">{value.toLocaleString()}</div>
      <div className={`flex items-center ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
        <span>{isPositive ? '↑' : '↓'}</span>
        <span className="ml-1">{Math.abs(change)}%</span>
        <span className="ml-1 text-gray-200">dari semester lalu</span>
      </div>
    </motion.div>
  )
}

function Table({ students, semesterDays = 100 }) {
  const [hoveredRow, setHoveredRow] = useState(null)

  const calculateAttendancePercentage = (attendance) => {
    return Math.round((attendance / semesterDays) * 100)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-2xl shadow-lg overflow-x-auto backdrop-blur-md bg-opacity-40">
      <h2 className="text-3xl font-bold mb-6 text-white">Data Siswa</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b border-sky-300">
            <th className="text-left p-4 text-gray-300">Nama</th>
            <th className="text-left p-4 text-gray-300">Kelas</th>
            <th className="text-left p-4 text-gray-300">Kehadiran (%)</th>
          </tr>
        </thead>
        <tbody>
          {(students || []).map((row, index) => {
            const attendancePercentage = calculateAttendancePercentage(row.attendance)
            return (
              <motion.tr
                key={row.id || `student-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredRow(index)}
                onHoverEnd={() => setHoveredRow(null)}
                className={`transition-colors duration-200 ${
                  hoveredRow === index ? 'bg-sky-100 bg-opacity-50' : 'hover:bg-sky-200 hover:bg-opacity-30'
                }`}
              >
                <td className="p-4 text-gray-300">{row.name}</td>
                <td className="p-4 text-gray-300">{row.class}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-600 rounded-full h-2.5">
                      <motion.div
                        className="bg-blue-400 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${attendancePercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                    <span className="min-w-[3ch] text-gray-300">{attendancePercentage}%</span>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}


function SubjectCard({ subject, attendanceData, onViewAttendance }) {
  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-2xl shadow-lg backdrop-blur-md bg-opacity-60 flex justify-between items-center"
      whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.4)" }}
      whileTap={{ scale: 0.98 }}
    >
      <div>
        <h3 className="text-2xl font-semibold mb-2 text-white">{subject}</h3>
        <p className="text-gray-200">Jumlah Hadir: {attendanceData.length}</p>
      </div>
      <button
        onClick={() => onViewAttendance(subject, attendanceData)}
        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Lihat Absensi
      </button>
    </motion.div>
  )
}

export default function Dashboard() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [students, setStudents] = useState([])
  const [dailyAttendanceData, setDailyAttendanceData] = useState({})

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/siswa')
        if (!response.ok) {
          throw new Error('Failed to fetch student data')
        }
        const data = await response.json()
        setStudents(data.success ? data.data : [])
      } catch (error) {
        console.error('Error fetching student data:', error)
        MySwal.fire('Error', 'Failed to fetch student data', 'error')
      }
    }

    const fetchDailyAttendance = async () => {
      try {
        const response = await fetch('/api/absen')
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data')
        }
        const data = await response.json()
        
        const processedData = processAttendanceData(data.data)
        setDailyAttendanceData(processedData)
      } catch (error) {
        console.error('Error fetching attendance data:', error)
      }
    }

    fetchStudents()
    fetchDailyAttendance()
    const intervalId = setInterval(fetchDailyAttendance, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const processAttendanceData = (data) => {
    const processedData = {}

    mataPelajaran.forEach(subject => {
      processedData[subject] = []
    })

    data.forEach(record => {
      if (processedData[record.mataPelajaran]) {
        processedData[record.mataPelajaran].push({
          nama: record.nama,
          kelas: record.kelas,
          tanggal: new Date(record.timestamp).toLocaleString(),
          keterangan: record.keterangan
        })
      }
    })

    return processedData
  }

  const handleViewAttendance = (subject, attendanceData) => {
    MySwal.fire({
      title: 'Pilih Kelas',
      input: 'select',
      inputOptions: {
        'VII': 'Kelas VII',
        'VIII': 'Kelas VIII',
        'IX': 'Kelas IX'
      },
      inputPlaceholder: 'Pilih kelas',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonText: 'Lihat Absensi',
      background: 'linear-gradient(to bottom right, #374151, #374164)',
      color: 'white',
      customClass: {
        input: 'text-gray-900',
        cancelButton: 'bg-gray-500 hover:bg-gray-600',
        confirmButton: 'bg-sky-500 hover:bg-sky-600',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedClass = result.value
        const filteredData = attendanceData.filter(record => record.kelas.startsWith(selectedClass))
        
        const attendanceTable = `
          <table style="width: 100%; text-align: left; border-collapse: collapse; color: white;">
            <thead>
              <tr>
                <th style="border-bottom: 1px solid #4B5563; padding: 12px;">Nama</th>
                <th style="border-bottom: 1px solid #4B5563; padding: 12px;">Kelas</th>
                <th style="border-bottom: 1px solid #4B5563; padding: 12px;">Tanggal</th>
                <th style="border-bottom: 1px solid #4B5563; padding: 12px;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(record => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #374151;">${record.nama}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #374151;">${record.kelas}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #374151;">${record.tanggal}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #374151;">${record.keterangan}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `

        MySwal.fire({
          title: `<span style="color: white;">Absensi - ${subject} (Kelas ${selectedClass})</span>`,
          html: attendanceTable,
          width: '80%',
          background: 'linear-gradient(to bottom right, #374151, #374164)',
          color: 'white',
          confirmButtonColor: '#3B82F6',
          showCloseButton: true,
          showCancelButton: true,
          cancelButtonText: 'Tutup',
          confirmButtonText: 'Cetak',
          customClass: {
            container: 'rounded-lg shadow-2xl',
            popup: 'rounded-lg',
            header: 'border-b border-blue-300',
            closeButton: 'text-white hover:text-gray-300',
            content: 'p-0',
            confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200',
            cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200'
          }
        }).then((printResult) => {
          if (printResult.isConfirmed) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
              <html>
                <head>
                  <title>Cetak Absensi ${subject} - Kelas ${selectedClass}</title>
                  <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                  </style>
                </head>
                <body>
                  <h1>Absensi - ${subject} (Kelas ${selectedClass})</h1>
                  <table>
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Kelas</th>
                        <th>Tanggal</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filteredData.map(record => `
                        <tr>
                          <td>${record.nama}</td>
                          <td>${record.kelas}</td>
                          <td>${record.tanggal}</td>
                          <td>${record.keterangan}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.print();
          }
        })
      }
    })
  }

  return (
    <div className=" min-h-screen p-4 sm:p-6  md:p-8 ">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <AnimatePresence>
          {cardData.map((data, index) => (
            <motion.div
              key={data.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                {...data}
                isHovered={hoveredCard === index}
                onHover={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Table students={students} />
      </motion.div>
      <motion.h2 
        className="text-3xl font-bold mb-6 text-white text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Data Absen Harian
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {mataPelajaran.map(subject => (
          <SubjectCard
            key={subject}
            subject={subject}
            attendanceData={dailyAttendanceData[subject] || []}
            onViewAttendance={handleViewAttendance}
          />
        ))}
      </motion.div>
    </div>
  )
}