// app/dashboard/admin/kelola-attendance/page.js
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function KelolaAbsen() {
  const [activeTahunAjaran, setActiveTahunAjaran] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [absensiData, setAbsensiData] = useState([]);

  const kelasList = ["VII A", "VII B", "VIII A", "VIII B", "IX A", "IX B"];
  const mataPelajaranList = [
    "MATEMATIKA",
    "B.INDONESIA",
    "B.INGGRIS",
    "IPA",
    "IPS",
    "PRAKARYA",
    "PJOK",
  ];

  useEffect(() => {
    fetchActiveTahunAjaran();
  }, []);

  useEffect(() => {
    if (activeTahunAjaran && selectedKelas) {
      fetchAttendanceData();
      fetchAbsensiData();
    }
  }, [activeTahunAjaran, selectedKelas, selectedDate, mataPelajaran]); // Added mataPelajaran dependency

  const fetchActiveTahunAjaran = async () => {
    try {
      const res = await fetch("/api/tahun-ajaran/active");
      const data = await res.json();

      if (data.success) {
        setActiveTahunAjaran(data.data);
      } else {
        setError("Tidak ada tahun ajaran yang aktif");
      }
    } catch (error) {
      setError("Gagal memuat tahun ajaran aktif");
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const res = await fetch(
        `/api/attendance?semester=${activeTahunAjaran.semester}&tahunAjaran=${activeTahunAjaran.tahunAjaran}&kelas=${selectedKelas}`
      );
      const data = await res.json();

      if (data.success) {
        setAttendanceData(data.data);
      }
    } catch (error) {
      setError("Gagal memuat data attendance");
    }
  };

  const fetchAbsensiData = async () => {
    try {
      // Update URL to include mataPelajaran filter
      const url = new URL("/api/absen", window.location.origin);
      url.searchParams.append("tanggal", selectedDate);
      url.searchParams.append("kelas", selectedKelas);
      url.searchParams.append("semester", activeTahunAjaran.semester);
      url.searchParams.append("tahunAjaran", activeTahunAjaran.tahunAjaran);
      if (mataPelajaran) {
        url.searchParams.append("mataPelajaran", mataPelajaran);
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setAbsensiData(data.data);
        setError(""); // Clear any previous errors
      }
    } catch (error) {
      setError("Gagal memuat data absensi");
    }
  };

  const handleMataPelajaranChange = (e) => {
    setMataPelajaran(e.target.value);
    setError(""); // Clear any previous errors
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-100">Daftar Kehadiran</h2>
          {activeTahunAjaran && (
            <p className="mt-2 text-gray-300">
              Tahun Ajaran: {activeTahunAjaran.tahunAjaran} - Semester{" "}
              {activeTahunAjaran.semester}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Kelas
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Kelas</option>
                {kelasList.map((kelas) => (
                  <option key={kelas} value={kelas}>
                    {kelas}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-emerald-900/50 border border-emerald-700 rounded-md">
              <p className="text-emerald-200">{success}</p>
            </div>
          )}

          {selectedKelas && (
            <div className="mt-6 space-y-6">
              <div className="bg-gray-800 rounded-lg shadow-xl">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    Rekap Kehadiran
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Nama
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            NISN
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Hadir
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Sakit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Izin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Alpa
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                            Persentase
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {attendanceData.map((attendance) => (
                          <tr key={attendance._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                              {attendance.siswaId.nama}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                              {attendance.siswaId.nisn}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                              {attendance.totalHadir}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                              {attendance.totalSakit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                              {attendance.totalIzin}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                              {attendance.totalAlpa}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-200">
                              {attendance.persentaseKehadiran}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
