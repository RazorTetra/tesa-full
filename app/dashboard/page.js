// app/dashboard/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import LoadingIndicator from "../components/LoadingIndicator";
import { SubjectCardSkeleton } from "../components/SubjectCardSkeleton";
import { IoMdRefresh } from "react-icons/io";

const MySwal = withReactContent(Swal);

// =============== Constants ===============
const mataPelajaran = [
  "MATEMATIKA",
  "IPA",
  "IPS",
  "BAHASA INDONESIA",
  "BAHASA INGGRIS",
  "BAHASA JEPANG",
  "AGAMA",
  "PKN",
  "PJOK",
  "MULOK",
  "PRAKARYA",
  "INFORMATIKA",
  "SENI",
  "PROJECT P5",
];

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

// =============== Helper Functions ===============
// Helper untuk mendapatkan tanggal lokal GMT+8
const getLocalDate = (date) => {
  const localDate = new Date(date);
  return new Date(localDate.getTime() + 8 * 60 * 60 * 1000);
};

// Helper untuk normalisasi string
const normalizeString = (str) => {
  if (!str) return "";
  return str.trim().toUpperCase();
};
// Helper untuk format tanggal lokal
const formatLocalDate = (date) => {
  const localDate = getLocalDate(date);
  return localDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// fungsi untuk refresh data absensi
const refreshAbsenData = async (mutate, setLoading, isHardRefresh = false) => {
  try {
    setLoading(true);
    let params = new URLSearchParams();

    // Get active tahun ajaran
    const tahunAjaranRes = await fetch("/api/tahun-ajaran/active");
    const tahunAjaranData = await tahunAjaranRes.json();

    if (tahunAjaranData.success) {
      params.append("tahunAjaran", tahunAjaranData.data.tahunAjaran);
      params.append("semester", tahunAjaranData.data.semester);
    }

    params.append("today", "true");

    if (isHardRefresh) {
      params.append("timestamp", new Date().getTime());
    }

    const response = await fetch(`/api/absen?${params.toString()}`, {
      cache: isHardRefresh ? "no-store" : "default",
      headers: isHardRefresh
        ? {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          }
        : {},
    });

    if (!response.ok) throw new Error("Network response was not ok");

    await mutate();

    MySwal.fire({
      icon: "success",
      title: `Data berhasil ${
        isHardRefresh ? "diperbarui (Hard Refresh)" : "diperbarui"
      }`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    MySwal.fire({
      icon: "error",
      title: "Gagal memperbarui data",
      text: error.message,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  } finally {
    setLoading(false);
  }
};

const processAttendanceData = (data) => {
  if (!data?.success || !Array.isArray(data.data)) return {};

  const processedData = {};

  mataPelajaran.forEach((subject) => {
    processedData[subject] = data.data.filter(
      (record) =>
        normalizeString(record.mataPelajaran) === normalizeString(subject)
    );
  });

  return processedData;
};

const calculateChange = (currentValue, type) => {
  const baseChanges = {
    siswa: 5,
    guru: 2,
    masuk: -3,
    keluar: 4,
  };
  return baseChanges[type] || 0;
};

// =============== Components ===============

function Card({ title, value, isHovered }) {
  return (
    <motion.div
      className={`p-6 rounded-2xl shadow-lg transition-all duration-300 bg-gradient-to-br ${
        isHovered
          ? "from-indigo-500 to-purple-400" // Gradient saat hover
          : "from-indigo-950 to-slate-900" // Gradient default
      } backdrop-blur-md bg-opacity-60`}
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 0px 20px rgba(79, 70, 229, 0.4)",
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="text-4xl font-bold text-white">
        {value.toLocaleString()}
      </div>
    </motion.div>
  );
}

// Optimized Table Component
function Table({ students, attendanceData, tahunAjaranAktif }) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Gunakan endpoint yang lebih ringan untuk data kehadiran
  const { data: attendanceStats } = useSWR(
    tahunAjaranAktif
      ? `/api/attendance?semester=${tahunAjaranAktif.semester}&tahunAjaran=${tahunAjaranAktif.tahunAjaran}`
      : null,
    fetcher,
    { revalidateOnFocus: true } // Auto update saat focus
  );

  // Process dan filter data siswa
  const processedStudents = useMemo(() => {
    if (!students || !attendanceStats?.data) return [];

    const filteredStudents = students
      .map((student) => {
        const studentAttendance = attendanceStats.data.find(
          (record) => record.siswaId._id === student._id
        );

        let percentage = 0;
        if (studentAttendance && tahunAjaranAktif) {
          const totalHadir = studentAttendance.totalHadir || 0;
          const totalHariEfektif = tahunAjaranAktif.totalHariEfektif || 1;
          percentage = (totalHadir / totalHariEfektif) * 100;
        }

        return {
          ...student,
          attendance: studentAttendance || {
            totalHadir: 0,
            totalSakit: 0,
            totalIzin: 0,
            totalAlpa: 0,
          },
          attendancePercentage: percentage,
        };
      })
      .filter(
        (student) =>
          student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.nisn?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Return semua hasil jika ada pencarian, atau 5 data teratas jika tidak ada
    return searchQuery
      ? filteredStudents.slice(0, 5)
      : filteredStudents.slice(0, 5);
  }, [students, attendanceStats, searchQuery, tahunAjaranAktif]);

  return (
    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-2xl shadow-lg overflow-x-auto backdrop-blur-md bg-opacity-40">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-white">Data Siswa</h2>
        <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[300px]">
          <input
            type="text"
            placeholder="Cari siswa (nama/kelas/NISN)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:border-sky-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {processedStudents.length === 0 ? (
        <div className="text-center text-gray-300 py-8">
          Tidak ada siswa yang ditemukan
        </div>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-sky-300">
                <th className="text-left p-4 text-gray-300">Nama</th>
                <th className="text-left p-4 text-gray-300">Kelas</th>
                <th className="text-left p-4 text-gray-300">Kehadiran (%)</th>
              </tr>
            </thead>
            <tbody>
              {processedStudents.map((student, index) => (
                <motion.tr
                  key={student._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredRow(index)}
                  onHoverEnd={() => setHoveredRow(null)}
                  className={`transition-colors duration-200 ${
                    hoveredRow === index
                      ? "bg-sky-100 bg-opacity-50"
                      : "hover:bg-sky-200 hover:bg-opacity-30"
                  }`}
                >
                  <td className="p-4 text-gray-300">{student.nama}</td>
                  <td className="p-4 text-gray-300">{student.kelas}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2.5">
                        <motion.div
                          className="bg-blue-400 h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${student.attendancePercentage}%`,
                          }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <span className="min-w-[3ch] text-gray-300">
                        {`${student.attendancePercentage.toFixed(1)}%`}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!searchQuery && students.length > 5 && (
            <div className="text-center text-gray-400 mt-4">
              Menampilkan 5 dari {students.length} siswa. Gunakan pencarian
              untuk menemukan siswa lainnya.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SubjectCard({ subject, attendanceData, onViewAttendance }) {
  const stats = {
    hadir: attendanceData.filter((r) => r.keterangan === "HADIR").length,
    sakit: attendanceData.filter((r) => r.keterangan === "SAKIT").length,
    izin: attendanceData.filter((r) => r.keterangan === "IZIN").length,
    alpa: attendanceData.filter((r) => r.keterangan === "ALPA").length,
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-2xl shadow-lg backdrop-blur-md bg-opacity-60"
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.4)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div>
        <h3 className="text-2xl font-semibold mb-2 text-white">{subject}</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-green-400">Hadir: {stats.hadir}</p>
            <p className="text-yellow-400">Sakit: {stats.sakit}</p>
          </div>
          <div>
            <p className="text-blue-400">Izin: {stats.izin}</p>
            <p className="text-red-400">Alpa: {stats.alpa}</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => onViewAttendance(subject, attendanceData)}
        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full"
      >
        Lihat Absensi
      </button>
    </motion.div>
  );
}

// =============== Main Component ===============
export default function Dashboard() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dailyAttendanceData, setDailyAttendanceData] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tahunAjaranAktif, setTahunAjaranAktif] = useState(null);

  // Config untuk data statis (guru, siswa, mutasi)
  const staticConfig = {
    refreshInterval: 900000, // 15 menit
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 menit cache
    errorRetryCount: 2,
  };

  // Config untuk absensi (data realtime)
  const realtimeConfig = {
    refreshInterval: 300000, // 5 menit
    revalidateOnFocus: false,
    dedupingInterval: 180000, // 3 menit cache
    errorRetryCount: 2,
  };

  // Data statis
  const { data: tahunAjaranData } = useSWR(
    "/api/tahun-ajaran/active",
    fetcher,
    staticConfig
  );
  const { data: studentsData, error: studentsError } = useSWR(
    "/api/siswa",
    fetcher,
    staticConfig
  );
  const { data: teachersData, error: teachersError } = useSWR(
    "/api/guru",
    fetcher,
    staticConfig
  );
  const { data: mutasiMasukData, error: mutasiMasukError } = useSWR(
    "/api/siswaMutasiMasuk",
    fetcher,
    staticConfig
  );
  const { data: mutasiKeluarData, error: mutasiKeluarError } = useSWR(
    "/api/siswaMutasiKeluar",
    fetcher,
    staticConfig
  );

  // Data realtime (absensi)
  const {
    data: absenData,
    error: absenError,
    mutate,
  } = useSWR(
    tahunAjaranAktif
      ? `/api/absen?today=true&tahunAjaran=${tahunAjaranAktif.tahunAjaran}&semester=${tahunAjaranAktif.semester}`
      : null,
    fetcher,
    {
      ...realtimeConfig,
      onSuccess: (data) => {
        if (data?.success) {
          const processedData = processAttendanceData(data, tahunAjaranAktif);
          setDailyAttendanceData(processedData);
        }
      },
    }
  );

  // Set tahun ajaran aktif when data is loaded
  useEffect(() => {
    if (tahunAjaranData?.success) {
      setTahunAjaranAktif(tahunAjaranData.data);
    }
  }, [tahunAjaranData]);

  const isLoading =
    !studentsData ||
    !teachersData ||
    !mutasiMasukData ||
    !mutasiKeluarData ||
    !absenData;

  // Error Handling
  if (
    studentsError ||
    teachersError ||
    mutasiMasukError ||
    mutasiKeluarError ||
    absenError
  ) {
    MySwal.fire({
      icon: "error",
      title: "Error",
      text: "Gagal mengambil data",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  if (isLoading) return <LoadingIndicator />;

  // Attendance Handling
  const handleViewAttendance = (subject, attendanceData) => {
    MySwal.fire({
      title: "Pilih Kelas",
      input: "select",
      inputOptions: {
        VII: "Kelas VII",
        VIII: "Kelas VIII",
        IX: "Kelas IX",
      },
      inputPlaceholder: "Pilih kelas",
      showCancelButton: true,
      cancelButtonText: "Batal",
      confirmButtonText: "Lihat Absensi",
      background: "linear-gradient(to bottom right, #374151, #374164)",
      color: "white",
      customClass: {
        input: "text-gray-900",
        cancelButton: "bg-gray-500 hover:bg-gray-600",
        confirmButton: "bg-sky-500 hover:bg-sky-600",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        showAttendanceDetails(subject, result.value, attendanceData);
      }
    });
  };

  const showAttendanceDetails = (subject, selectedClass, attendanceData) => {
    const filteredData = attendanceData.filter((record) => {
      return record.siswaId.kelas.startsWith(selectedClass);
    });

    const attendanceTable = generateAttendanceTable(filteredData);

    MySwal.fire({
      title: `<span style="color: white;">Absensi - ${subject} (Kelas ${selectedClass})</span>`,
      html:
        attendanceTable ||
        '<p style="color: white;">Tidak ada data absensi untuk kelas ini</p>',
      width: "80%",
      background: "linear-gradient(to bottom right, #374151, #374164)",
      color: "white",
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: "Tutup",
      confirmButtonText: isAdmin ? "Cetak" : "Tutup",
      showConfirmButton: isAdmin,
      customClass: {
        container: "rounded-lg shadow-2xl",
        popup: "rounded-lg",
        header: "border-b border-blue-300",
        closeButton: "text-white hover:text-gray-300",
        content: "p-0",
        confirmButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded",
        cancelButton:
          "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded",
      },
    }).then((result) => {
      if (result.isConfirmed && isAdmin) {
        handlePrint(subject, selectedClass, filteredData);
      }
    });
  };

  const generateAttendanceTable = (filteredData) => {
    return `
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
        ${filteredData
          .map(
            (record) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #374151;">${
              record.siswaId.nama
            }</td>
            <td style="padding: 12px; border-bottom: 1px solid #374151;">${
              record.siswaId.kelas
            }</td>
            <td style="padding: 12px; border-bottom: 1px solid #374151;">
              ${formatLocalDate(record.tanggal)}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #374151;">${
              record.keterangan
            }</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
  };

  const handlePrint = (subject, selectedClass, filteredData) => {
    const now = getLocalDate(new Date());
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>Cetak Absensi ${subject} - Kelas ${selectedClass}</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 { 
            text-align: center;
            margin-bottom: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .print-date {
            text-align: right;
            margin-bottom: 20px;
          }
          @media print {
            table { page-break-inside: auto }
            tr { page-break-inside: avoid; page-break-after: auto }
          }
        </style>
      </head>
      <body>
        <h1>Absensi - ${subject} (Kelas ${selectedClass})</h1>
        <div class="print-date">
          Dicetak pada: ${now.toLocaleString("id-ID")}
        </div>
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
            ${filteredData
              .map(
                (record) => `
              <tr>
                <td>${record.siswaId.nama}</td>
                <td>${record.siswaId.kelas}</td>
                <td>${formatLocalDate(record.tanggal)}</td>
                <td>${record.keterangan}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 50px;">
          <p style="text-align: right;">
            Tompaso, ${now.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            <br><br><br><br>
            _____________________<br>
            Kepala Sekolah
          </p>
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.print();
  };

  // Data untuk Card Dashboard
  const cardData = [
    {
      title: "Jumlah Siswa",
      value: studentsData?.data?.length || 0,
      change: calculateChange(studentsData?.data?.length, "siswa"),
    },
    {
      title: "Jumlah Guru",
      value: teachersData?.data?.length || 0,
      change: calculateChange(teachersData?.data?.length, "guru"),
    },
    {
      title: "Mutasi Masuk",
      value: mutasiMasukData?.data?.length || 0,
      change: calculateChange(mutasiMasukData?.data?.length, "masuk"),
    },
    {
      title: "Mutasi Keluar",
      value: mutasiKeluarData?.data?.length || 0,
      change: calculateChange(mutasiKeluarData?.data?.length, "keluar"),
    },
  ];

  // Render Utama
  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      {/* Summary Cards */}
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

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Table
          students={studentsData?.data || []}
          attendanceData={absenData}
          tahunAjaranAktif={tahunAjaranAktif}
        />
      </motion.div>

      {/* Daily Attendance Section */}
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Data Absen Harian
          {tahunAjaranAktif && (
            <span className="text-sm font-normal text-gray-400 ml-4">
              Tahun Ajaran: {tahunAjaranAktif.tahunAjaran} - Semester{" "}
              {tahunAjaranAktif.semester}
            </span>
          )}
        </motion.h2>
        <div className="relative">
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => refreshAbsenData(mutate, setIsRefreshing, true)}
              disabled={isRefreshing}
              className={`flex items-center px-4 py-2 rounded-lg border-l border-blue-700
              ${
                isRefreshing
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } 
              text-white transition-all duration-300 shadow-lg hover:shadow-xl`}
              title="Perbarui dan ambil data baru dari server"
            >
              <IoMdRefresh
                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {isRefreshing
          ? [...Array(mataPelajaran.length)].map((_, index) => (
              <SubjectCardSkeleton key={index} />
            ))
          : !absenData
          ? [...Array(mataPelajaran.length)].map((_, index) => (
              <SubjectCardSkeleton key={index} />
            ))
          : mataPelajaran.map((subject) => (
              <SubjectCard
                key={subject}
                subject={subject}
                attendanceData={dailyAttendanceData[subject] || []}
                onViewAttendance={handleViewAttendance}
              />
            ))}
      </motion.div>
    </div>
  );
}
