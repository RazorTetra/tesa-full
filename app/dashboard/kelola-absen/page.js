// app/kelola-absen/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function KelolaAbsen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [absenList, setAbsenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterKelas, setFilterKelas] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [activeTahunAjaran, setActiveTahunAjaran] = useState(null);

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch logic remains the same
  useEffect(() => {
    const getActiveTahunAjaran = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/tahun-ajaran/active`);
        const data = await res.json();
        if (data.success) {
          setActiveTahunAjaran(data.data);
          setFilterTahunAjaran(data.data.tahunAjaran);
          setFilterSemester(data.data.semester.toString());
        }
      } catch (error) {
        console.error("Error fetching active tahun ajaran:", error);
      }
    };

    const getAllTahunAjaran = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/tahun-ajaran`);
        const data = await res.json();
        if (data.success) {
          setTahunAjaranList(data.data);
        }
      } catch (error) {
        console.error("Error fetching tahun ajaran:", error);
      }
    };

    getActiveTahunAjaran();
    getAllTahunAjaran();
  }, [apiUrl]);

  useEffect(() => {
    const fetchAbsensi = async () => {
      try {
        setLoading(true);
        let url = `${apiUrl}/api/absen?`;

        if (filterKelas) url += `kelas=${filterKelas}&`;
        if (filterTanggal) url += `tanggal=${filterTanggal}&`;
        if (filterTahunAjaran) url += `tahunAjaran=${filterTahunAjaran}&`;
        if (filterSemester) url += `semester=${filterSemester}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setAbsenList(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Gagal mengambil data absensi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (filterTahunAjaran && filterSemester) {
      fetchAbsensi();
    }
  }, [apiUrl, filterKelas, filterTanggal, filterTahunAjaran, filterSemester]);

  const handleEdit = (absen) => {
    setEditData(absen);
    setEditMode(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/absen/${editData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keterangan: editData.keterangan,
          mataPelajaran: editData.mataPelajaran,
          tanggal: editData.tanggal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAbsenList(
          absenList.map((item) =>
            item._id === editData._id ? data.data : item
          )
        );
        setEditMode(false);
        setEditData(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Gagal mengupdate absensi");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus absensi ini?")) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/absen/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setAbsenList(absenList.filter((item) => item._id !== id));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Gagal menghapus absensi");
      console.error(err);
    }
  };

  const kelasList = ["7A", "7B", "7C", "8A", "8B", "8C", "9A", "9B", "9C"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="text-center text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Kelola Absensi</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="bg-gray-700 border border-gray-600 rounded p-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((kelas) => (
              <option key={kelas} value={kelas}>
                {kelas}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="bg-gray-700 border border-gray-600 rounded p-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
          />

          <select
            className="bg-gray-700 border border-gray-600 rounded p-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterTahunAjaran}
            onChange={(e) => setFilterTahunAjaran(e.target.value)}
          >
            <option value="">Pilih Tahun Ajaran</option>
            {tahunAjaranList.map((ta) => (
              <option key={ta._id} value={ta.tahunAjaran}>
                {ta.tahunAjaran}
              </option>
            ))}
          </select>

          <select
            className="bg-gray-700 border border-gray-600 rounded p-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
          >
            <option value="">Pilih Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
      </div>

      {/* Edit Modal */}
      {editMode && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              Edit Absensi
            </h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block mb-2 text-gray-300">Keterangan</label>
                <select
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full text-gray-200"
                  value={editData.keterangan}
                  onChange={(e) =>
                    setEditData({ ...editData, keterangan: e.target.value })
                  }
                >
                  {["HADIR", "SAKIT", "IZIN", "ALPA"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-gray-300">
                  Mata Pelajaran
                </label>
                <input
                  type="text"
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full text-gray-200"
                  value={editData.mataPelajaran}
                  onChange={(e) =>
                    setEditData({ ...editData, mataPelajaran: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-gray-300">Tanggal</label>
                <input
                  type="date"
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full text-gray-200"
                  value={editData.tanggal.split("T")[0]}
                  onChange={(e) =>
                    setEditData({ ...editData, tanggal: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-700 text-gray-200 px-4 py-2 rounded hover:bg-gray-600"
                  onClick={() => {
                    setEditMode(false);
                    setEditData(null);
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Absensi List */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Nama Siswa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Mata Pelajaran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Keterangan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {absenList.map((absen) => (
              <tr key={absen._id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {absen.siswaId.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {absen.kelas}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {new Date(absen.tanggal).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {absen.mataPelajaran}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      absen.keterangan === "HADIR" &&
                      "bg-green-900/50 text-green-300"
                    }
                    ${
                      absen.keterangan === "SAKIT" &&
                      "bg-yellow-900/50 text-yellow-300"
                    }
                    ${
                      absen.keterangan === "IZIN" &&
                      "bg-blue-900/50 text-blue-300"
                    }
                    ${
                      absen.keterangan === "ALPA" &&
                      "bg-red-900/50 text-red-300"
                    }
                  `}
                  >
                    {absen.keterangan}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(absen)}
                    className="text-blue-400 hover:text-blue-300 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(absen._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
