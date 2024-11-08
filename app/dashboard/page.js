// app/dashboard/page.js
"use client";

import { useState } from "react";
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
const normalizeString = (str) => str.trim().toUpperCase();

// Helper untuk mendapatkan tanggal lokal GMT+8
const getLocalDate = (date) => {
  const localDate = new Date(date);
  // Sesuaikan ke GMT+8
  localDate.setHours(localDate.getHours() + 8);
  return localDate;
};

// Helper untuk format tanggal ke midnight GMT+8
const setLocalMidnight = (date) => {
  const localDate = getLocalDate(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

// fungsi untuk refresh data absensi
const refreshAbsenData = async (mutate, setLoading, isHardRefresh = false) => {
  try {
    setLoading(true);
    if (isHardRefresh) {
      // Hard refresh: Bypass cache dan ambil langsung dari server
      await fetch("/api/absen?today=true&timestamp=" + new Date().getTime(), {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }
    // Revalidate SWR cache
    await mutate("/api/absen?today=true", undefined, { revalidate: true });

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

// Fungsi helper untuk normalisasi tanggal
const normalizeDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

const processAttendanceData = (data) => {
  if (!data || !Array.isArray(data)) return {};

  try {
    // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
    const today = normalizeDate(new Date());

    // Filter records untuk hari ini
    const todayData = data.filter((record) => {
      if (!record?.tanggal) return false;
      return normalizeDate(record.tanggal) === today;
    });

    console.log("Today:", today);
    console.log("Today Data:", todayData);

    // Proses data per mata pelajaran
    const processedData = {};
    mataPelajaran.forEach((subject) => {
      processedData[subject] = todayData.filter(
        (record) =>
          normalizeString(record.mataPelajaran) === normalizeString(subject)
      );
    });

    console.log("Processed Data:", processedData);
    return processedData;
  } catch (error) {
    console.error("Error processing attendance data:", error);
    return {};
  }
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

const formatLocalDate = (date) => {
  const localDate = getLocalDate(date);
  return localDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// =============== Components ===============
function Card({ title, value, change, isHovered }) {
  const isPositive = change >= 0;
  return (
    <motion.div
      className={`p-6 rounded-2xl shadow-lg transition-all duration-300 bg-gradient-to-br ${
        isHovered
          ? "from-indigo-500 to-purple-400"
          : "from-indigo-950 to-slate-900"
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
      <div className="text-4xl font-bold mb-2 text-white">
        {value.toLocaleString()}
      </div>
      <div
        className={`flex items-center ${
          isPositive ? "text-green-300" : "text-red-300"
        }`}
      >
        <span>{isPositive ? "↑" : "↓"}</span>
        <span className="ml-1">{Math.abs(change)}%</span>
        <span className="ml-1 text-gray-200">dari semester lalu</span>
      </div>
    </motion.div>
  );
}

function Table({ students, absenData }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  const calculateAttendancePercentage = (studentName) => {
    if (!absenData || !studentName) return 0;

    const studentAttendance = absenData.filter(
      (record) =>
        record.nama === studentName &&
        record.keterangan.toLowerCase() === "hadir"
    ).length;

    const totalRecords = absenData.filter(
      (record) => record.nama === studentName
    ).length;

    return totalRecords === 0
      ? 0
      : Math.round((studentAttendance / totalRecords) * 100);
  };

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
          {students.map((student, index) => {
            const attendancePercentage = calculateAttendancePercentage(
              student.nama
            );
            return (
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
                        animate={{ width: `${attendancePercentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                    <span className="min-w-[3ch] text-gray-300">
                      {attendancePercentage}%
                    </span>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SubjectCard({ subject, attendanceData, onViewAttendance }) {
  const presentCount =
    attendanceData?.filter(
      (record) => record.keterangan?.toLowerCase() === "hadir"
    )?.length || 0;

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-2xl shadow-lg backdrop-blur-md bg-opacity-60 flex justify-between items-center"
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 0px 20px rgba(59, 130, 246, 0.4)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div>
        <h3 className="text-2xl font-semibold mb-2 text-white">{subject}</h3>
        <p className="text-gray-200">
          {attendanceData?.length > 0
            ? `Jumlah Hadir: ${presentCount}`
            : "Belum ada absensi hari ini"}
        </p>
      </div>
      <button
        onClick={() => onViewAttendance(subject, attendanceData)}
        className={`${
          attendanceData?.length === 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-white bg-opacity-20 hover:bg-opacity-30"
        } text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg`}
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
  const { mutate } = useSWR("/api/absen?today=true", fetcher);

  // SWR Configuration
  const swrOptions = {
    refreshInterval: 300000,
    revalidateOnFocus: false,
    dedupingInterval: 180000,
  };

  // Data Fetching
  const { data: studentsData, error: studentsError } = useSWR(
    "/api/siswa",
    fetcher,
    swrOptions
  );
  const { data: teachersData, error: teachersError } = useSWR(
    "/api/guru",
    fetcher,
    swrOptions
  );
  const { data: mutasiMasukData, error: mutasiMasukError } = useSWR(
    "/api/siswaMutasiMasuk",
    fetcher,
    swrOptions
  );
  const { data: mutasiKeluarData, error: mutasiKeluarError } = useSWR(
    "/api/siswaMutasiKeluar",
    fetcher,
    swrOptions
  );
  const { data: absenData, error: absenError } = useSWR("/api/absen", fetcher, {
    ...swrOptions,
    onSuccess: (data) => {
      if (data.success) {
        const processedData = processAttendanceData(data.data);
        setDailyAttendanceData(processedData);
      }
    },
  });

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

  if (isLoading) {
    return <LoadingIndicator />;
  }

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
    // Filter untuk mendapatkan semua data kelas yang dimulai dengan VII, VIII, atau IX
    const filteredData = attendanceData.filter((record) => {
      return record.kelas.startsWith(selectedClass);
    });

    console.log("Selected Class:", selectedClass);
    console.log("Filtered Data:", filteredData);
    console.log("All Data:", attendanceData);

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
      // Tambahkan handler untuk tombol cetak
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
                record.nama
              }</td>
              <td style="padding: 12px; border-bottom: 1px solid #374151;">${
                record.kelas
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
                  <td>${record.nama}</td>
                  <td>${record.kelas}</td>
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
          absenData={absenData?.data || []}
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
          ? // Tampilkan skeleton loader saat refresh
            [...Array(mataPelajaran.length)].map((_, index) => (
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
