// app/dashboard/attendance/page.js
"use client";

import { useState, useEffect } from "react";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [rekapData, setRekapData] = useState({
    rekapKehadiran: [],
    statistikKelas: {},
  });
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
        console.error("Error fetching tahun ajaran:", error);
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
        console.error("Error fetching kelas:", error);
        alert("Gagal mengambil data kelas");
      }
    };

    fetchKelas();
  }, []);

  // Fetch rekap data when filters change
  useEffect(() => {
    const fetchRekap = async () => {
      if (!filters.semester || !filters.tahunAjaran) return;

      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          semester: filters.semester,
          tahunAjaran: filters.tahunAjaran,
          ...(filters.kelas && { kelas: filters.kelas }),
        });

        const response = await fetch(`/api/attendance/rekap?${queryParams}`);
        const data = await response.json();

        if (data.success) {
          setRekapData(data.data);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Error fetching rekap:", error);
        alert("Gagal mengambil data rekap kehadiran");
      } finally {
        setLoading(false);
      }
    };

    fetchRekap();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderStatistikKelas = () => {
    if (
      !rekapData.statistikKelas ||
      Object.keys(rekapData.statistikKelas).length === 0
    ) {
      return null;
    }

    return (
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(rekapData.statistikKelas).map(([kelas, stats]) => (
          <div
            key={kelas}
            className="bg-slate-800/30 p-4 rounded-lg border border-slate-700"
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Kelas {kelas}
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>Total Siswa: {stats.totalSiswa}</p>
              <p>Rata-rata Kehadiran: {stats.rataRataKehadiran}%</p>
              <p>Total Hari Efektif: {stats.totalHariEfektif}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <p>Hadir: {stats.detailKehadiran.hadir}</p>
                <p>Sakit: {stats.detailKehadiran.sakit}</p>
                <p>Izin: {stats.detailKehadiran.izin}</p>
                <p>Alpa: {stats.detailKehadiran.alpa}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Rekap Kehadiran Siswa
      </h1>

      <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg backdrop-blur-sm mb-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            name="tahunAjaran"
            value={filters.tahunAjaran}
            onChange={handleFilterChange}
            className="bg-slate-900 border-slate-700 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="bg-slate-900 border-slate-700 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Pilih Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>

          <select
            name="kelas"
            value={filters.kelas}
            onChange={handleFilterChange}
            className="bg-slate-900 border-slate-700 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Kelas</option>
            {kelas.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
        </div>

        {activeTahunAjaran && (
          <div className="text-sm text-slate-400">
            Tahun Ajaran Aktif: {activeTahunAjaran.tahunAjaran} - Semester{" "}
            {activeTahunAjaran.semester}
          </div>
        )}
      </div>

      {renderStatistikKelas()}

      {loading ? (
        <div className="text-center py-4 text-white">Loading...</div>
      ) : (
        <div className="bg-slate-800/50 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Nama Siswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  NISN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Hadir
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Sakit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Izin
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Alpa
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total Hari
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Persentase
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {rekapData.rekapKehadiran?.length > 0 ? (
                rekapData.rekapKehadiran.map((rekap) => (
                  <tr key={rekap.siswa.id} className="text-slate-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rekap.siswa.nama}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rekap.siswa.nisn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rekap.siswa.kelas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {rekap.kehadiran.hadir}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {rekap.kehadiran.sakit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {rekap.kehadiran.izin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {rekap.kehadiran.alpa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {rekap.kehadiran.totalHariEfektif}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {rekap.kehadiran.persentase}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-4 text-center text-slate-400"
                  >
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
