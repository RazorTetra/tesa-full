"use client";

import { useState, useEffect } from 'react';

export default function TahunAjaranPage() {
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    tahunAjaran: "",
    semester: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    isActive: false
  });

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch('/api/tahun-ajaran');
      const data = await response.json();
      if (data.success) {
        setTahunAjaranList(data.data);
      }
    } catch (error) {
      alert("Gagal mengambil data tahun ajaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tahun-ajaran', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Tahun ajaran berhasil ditambahkan');
        setFormData({
          tahunAjaran: "",
          semester: "",
          tanggalMulai: "",
          tanggalSelesai: "",
          isActive: false
        });
        fetchTahunAjaran();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert('Gagal menambahkan tahun ajaran: ' + error.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await fetch(`/api/tahun-ajaran/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: true }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Status tahun ajaran berhasil diubah');
        fetchTahunAjaran();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      alert('Gagal mengubah status tahun ajaran: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
    <div className="p-6 bg-[#121212] text-white">
      <h1 className="text-2xl font-bold mb-6">Pengaturan Tahun Ajaran</h1>

      {/* Form Tambah Tahun Ajaran */}
      <div className="bg-[#1a1a1a] rounded-lg shadow-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Tambah Tahun Ajaran Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Tahun Ajaran</label>
              <select
                value={formData.tahunAjaran}
                onChange={(e) => setFormData({...formData, tahunAjaran: e.target.value})}
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Pilih Tahun Ajaran</option>
                {generateTahunAjaranOptions().map((tahun) => (
                  <option key={tahun} value={tahun}>{tahun}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Pilih Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Tanggal Mulai</label>
              <input
                type="date"
                value={formData.tanggalMulai}
                onChange={(e) => setFormData({...formData, tanggalMulai: e.target.value})}
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Tanggal Selesai</label>
              <input
                type="date"
                value={formData.tanggalSelesai}
                onChange={(e) => setFormData({...formData, tanggalSelesai: e.target.value})}
                required
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="mr-2 bg-[#2a2a2a] border-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-300">Set sebagai tahun ajaran aktif</label>
          </div>

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
        <h2 className="text-lg font-semibold p-6 border-b border-gray-700">Daftar Tahun Ajaran</h2>
        {loading ? (
          <div className="p-6 text-center text-gray-300">Loading...</div>
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
                    <td className="px-6 py-4 text-gray-300">{ta.tahunAjaran}</td>
                    <td className="px-6 py-4 text-gray-300">Semester {ta.semester}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDate(ta.tanggalMulai)}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDate(ta.tanggalSelesai)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${ta.isActive ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'}`}>
                        {ta.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!ta.isActive && (
                        <button
                          onClick={() => handleActivate(ta._id)}
                          className="text-blue-400 hover:text-blue-300 transition duration-150"
                        >
                          Aktifkan
                        </button>
                      )}
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