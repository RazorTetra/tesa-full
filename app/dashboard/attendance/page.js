// app/dashboard/attendance/page.js
"use client";

import { useState, useEffect } from "react";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [activeTahunAjaran, setActiveTahunAjaran] = useState(null);
  const [filters, setFilters] = useState({
    semester: "",
    tahunAjaran: "",
    kelas: "",
  });
  const [kelas, setKelas] = useState([]);

  // Fetch tahun ajaran data on mount
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        // Get all tahun ajaran
        const responseAll = await fetch("/api/tahun-ajaran");
        const dataAll = await responseAll.json();
        if (dataAll.success) {
          setTahunAjaranList(dataAll.data);
        }

        // Get active tahun ajaran
        const responseActive = await fetch("/api/tahun-ajaran/active");
        const dataActive = await responseActive.json();
        if (dataActive.success) {
          setActiveTahunAjaran(dataActive.data);
          setFilters((prev) => ({
            ...prev,
            semester: dataActive.data.semester.toString(),
            tahunAjaran: dataActive.data.tahunAjaran,
          }));
        }
      } catch (error) {
        alert("Gagal mengambil data tahun ajaran");
      }
    };

    fetchTahunAjaran();
  }, []);

  // Fetch kelas list
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const response = await fetch("/api/siswa");
        const data = await response.json();
        if (data.success) {
          const uniqueKelas = [
            ...new Set(data.data.map((siswa) => siswa.kelas)),
          ];
          setKelas(uniqueKelas.sort());
        }
      } catch (error) {
        alert("Gagal mengambil data kelas");
      }
    };

    fetchKelas();
  }, []);

  // Fetch attendance data when filters change
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!filters.semester || !filters.tahunAjaran || !filters.kelas) return;

      setLoading(true);
      try {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/attendance?${queryString}`);
        const data = await response.json();

        if (data.success) {
          setAttendanceData(data.data);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        alert("Gagal mengambil data kehadiran");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculatePercentage = (present, total) => {
    return ((present / total) * 100).toFixed(1) + "%";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rekap Kehadiran Siswa</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            name="tahunAjaran"
            value={filters.tahunAjaran}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
            <option value="">Pilih Tahun Ajaran</option>
            {tahunAjaranList.map((ta) => (
              <option key={ta._id} value={ta.tahunAjaran}>
                {ta.tahunAjaran} {ta.isActive ? "(Aktif)" : ""}
              </option>
            ))}
          </select>

          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
            <option value="">Pilih Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>

          <select
            name="kelas"
            value={filters.kelas}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
            <option value="">Pilih Kelas</option>
            {kelas.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
        </div>

        {activeTahunAjaran && (
          <div className="text-sm text-gray-600">
            Tahun Ajaran Aktif: {activeTahunAjaran.tahunAjaran} - Semester{" "}
            {activeTahunAjaran.semester}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Siswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NISN
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hadir
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sakit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Izin
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alpa
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hari
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Persentase
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.length > 0 ? (
                attendanceData.map((attendance) => (
                  <tr key={attendance._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance.siswaId.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance.siswaId.nisn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {attendance.totalHadir}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {attendance.totalSakit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {attendance.totalIzin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {attendance.totalAlpa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {attendance.totalHariEfektif}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {calculatePercentage(
                        attendance.totalHadir,
                        attendance.totalHariEfektif
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    Tidak ada data kehadiran untuk filter yang dipilih
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
