// app/dashboard/tahun-ajaran/page.js
"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function TahunAjaranPage() {
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    tahunAjaran: "",
    semester: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    totalHariEfektif: "",
    isActive: false,
  });

  const handleDelete = async (id, isActive) => {
    try {
      // Cek jika tahun ajaran aktif
      if (isActive) {
        MySwal.fire({
          icon: "error",
          title: "Tidak Dapat Menghapus",
          text: "Tahun ajaran yang sedang aktif tidak dapat dihapus",
        });
        return;
      }

      const result = await MySwal.fire({
        title: "Apakah Anda yakin?",
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const response = await fetch(`/api/tahun-ajaran/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          MySwal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Tahun ajaran berhasil dihapus",
          });
          fetchTahunAjaran(); // Refresh data
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message || "Gagal menghapus tahun ajaran",
      });
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      setError(null);
      const response = await fetch("/api/tahun-ajaran");

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.success) {
        setTahunAjaranList(data.data || []);
      } else {
        throw new Error(data.error || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching tahun ajaran:", error);
      setError(error.message);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: `Gagal mengambil data: ${error.message}`,
        footer: "Silahkan refresh halaman atau hubungi administrator",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const LoadingAlert = MySwal.mixin({
    allowOutsideClick: false,
    didOpen: () => {
      MySwal.showLoading();
    },
  });

  const validateForm = () => {
    // Validasi format tahun ajaran
    const tahunAjaranRegex = /^\d{4}\/\d{4}$/;
    if (!tahunAjaranRegex.test(formData.tahunAjaran)) {
      throw new Error("Format tahun ajaran harus YYYY/YYYY");
    }

    // Validasi tanggal
    const tanggalMulai = new Date(formData.tanggalMulai);
    const tanggalSelesai = new Date(formData.tanggalSelesai);
    if (tanggalMulai >= tanggalSelesai) {
      throw new Error("Tanggal mulai harus sebelum tanggal selesai");
    }

    // Validasi total hari efektif
    const totalHari = parseInt(formData.totalHariEfektif);
    if (isNaN(totalHari) || totalHari < 1) {
      throw new Error("Total hari efektif harus minimal 1");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      validateForm();

      const response = await fetch("/api/tahun-ajaran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        await MySwal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Tahun ajaran berhasil ditambahkan",
        });
        setFormData({
          tahunAjaran: "",
          semester: "",
          tanggalMulai: "",
          tanggalSelesai: "",
          totalHariEfektif: "",
          isActive: false,
        });
        fetchTahunAjaran();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const handleActivate = async (id) => {
    try {
      const confirmation = await MySwal.fire({
        title: "Konfirmasi",
        text: "Apakah Anda yakin ingin mengaktifkan tahun ajaran ini? Sistem akan membuat data attendance untuk semua siswa.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Aktifkan",
        cancelButtonText: "Batal",
      });

      if (confirmation.isConfirmed) {
        // Tampilkan loading state
        LoadingAlert.fire({
          title: "Sedang Memproses",
          html: "Mengaktifkan tahun ajaran dan membuat data attendance...",
        });

        const response = await fetch(`/api/tahun-ajaran/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: true }),
        });

        const data = await response.json();

        // Tutup loading alert
        LoadingAlert.close();

        if (data.success) {
          await MySwal.fire({
            icon: "success",
            title: "Berhasil",
            html: `
              ${data.data.message}<br/>
              <small class="text-gray-500">
                Total siswa: ${data.data.totalSiswa}<br/>
                Data attendance dibuat: ${data.data.totalAttendanceRecords}
              </small>
            `,
          });
          fetchTahunAjaran();
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error) {
      LoadingAlert.close();
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengubah status tahun ajaran: " + error.message,
        footer: "Silakan coba lagi atau hubungi administrator",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const generateTahunAjaranOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let i = 0; i < 5; i++) {
      const tahun = `${currentYear + i}/${currentYear + i + 1}`;
      options.push(tahun);
    }
    return options;
  };

  return (
    <div className="p-6 bg-[#121212] text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Tahun Ajaran</h1>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded relative">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={fetchTahunAjaran}
            className="bg-red-800 text-white px-3 py-1 rounded text-sm ml-3 hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Form Tambah Tahun Ajaran */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Tambah Tahun Ajaran Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Tahun Ajaran
              </label>
              <select
                value={formData.tahunAjaran}
                onChange={(e) =>
                  setFormData({ ...formData, tahunAjaran: e.target.value })
                }
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Pilih Tahun Ajaran</option>
                {generateTahunAjaranOptions().map((tahun) => (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Pilih Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Total Hari Efektif
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalHariEfektif}
                onChange={(e) =>
                  setFormData({ ...formData, totalHariEfektif: e.target.value })
                }
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Masukkan total hari"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={formData.tanggalMulai}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalMulai: e.target.value })
                }
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={formData.tanggalSelesai}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalSelesai: e.target.value })
                }
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="mr-2 bg-[#2a2a2a] border-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-300">
              Set sebagai tahun ajaran aktif
            </label>
          </div> */}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-150"
          >
            Simpan
          </button>
        </form>
      </div>

      {/* Daftar Tahun Ajaran */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-xl">
        <h2 className="text-lg font-semibold p-6 border-b border-gray-700">
          Daftar Tahun Ajaran
        </h2>
        {loading ? (
          <div className="p-6 text-center text-gray-300">
            <div role="status">
              <svg
                aria-hidden="true"
                className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Memuat data tahun ajaran...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-gray-400">
            <p>Gagal memuat data</p>
            <button
              onClick={fetchTahunAjaran}
              className="mt-2 text-blue-400 hover:text-blue-300"
            >
              Coba lagi
            </button>
          </div>
        ) : tahunAjaranList.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Belum ada data tahun ajaran
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#2a2a2a]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Tahun Ajaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Total Hari
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Tanggal Mulai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Tanggal Selesai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {tahunAjaranList.map((ta) => (
                  <tr key={ta._id}>
                    <td className="px-6 py-4 text-gray-300">
                      {ta.tahunAjaran}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      Semester {ta.semester}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {ta.totalHariEfektif} hari
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(ta.tanggalMulai)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(ta.tanggalSelesai)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          ta.isActive
                            ? "bg-green-900 text-green-200"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {ta.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!ta.isActive && (
                          <button
                            onClick={() => handleActivate(ta._id)}
                            className="text-blue-400 hover:text-blue-300 transition duration-150"
                          >
                            Aktifkan
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ta._id, ta.isActive)}
                          className={`text-red-400 hover:text-red-300 transition duration-150 ${
                            ta.isActive ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={ta.isActive}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
