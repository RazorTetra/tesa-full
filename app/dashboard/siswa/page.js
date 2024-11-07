// app/dashboard/siswa/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react"
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/master.module.css";

const MySwal = withReactContent(Swal);

export default function SiswaPage() {
  const [siswa, setSiswa] = useState([]);
  const [filteredSiswa, setFilteredSiswa] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const [currentUserData, setCurrentUserData] = useState(null);

  // Fetch data siswa
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const response = await fetch("/api/siswa");
        const data = await response.json();

        if (data.success) {
          setSiswa(data.data);
          setFilteredSiswa(data.data);
        } else {
          showNotification("error", "Gagal mengambil data siswa", data.error);
        }
      } catch (error) {
        showNotification(
          "error",
          "Error",
          "Terjadi kesalahan saat mengambil data siswa"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiswa();
  }, []);

  // Hanya tampilkan data siswa yang sesuai dengan user yang login
  useEffect(() => {
    if (session?.user?.role === "user") {
      const getCurrentUserData = async () => {
        try {
          const response = await fetch(`/api/siswa/${session.user.id}`);
          const data = await response.json();
          if (data.success) {
            setCurrentUserData(data.data);
            setFilteredSiswa([data.data]);
          }
        } catch (error) {
          console.error("Error fetching current user data:", error);
        }
      };
      getCurrentUserData();
    }
  }, [session]);

  // Filter siswa berdasarkan pencarian
  useEffect(() => {
    const results = siswa.filter(
      (s) =>
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nisn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.kelas.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSiswa(results);
  }, [searchTerm, siswa]);

  // Handle delete siswa
  const handleDelete = useCallback(async (id) => {
    const result = await MySwal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus data siswa ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/siswa/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
          setSiswa((prevSiswa) => prevSiswa.filter((s) => s._id !== id));
          setFilteredSiswa((prevFiltered) =>
            prevFiltered.filter((s) => s._id !== id)
          );
          showNotification(
            "success",
            "Berhasil",
            "Data siswa berhasil dihapus"
          );
        } else {
          showNotification(
            "error",
            "Gagal",
            data.error || "Gagal menghapus data siswa"
          );
        }
      } catch (error) {
        showNotification(
          "error",
          "Error",
          "Terjadi kesalahan saat menghapus data siswa"
        );
      }
    }
  }, []);

  // Handle preview image
  const handleImagePreview = useCallback((imageUrl, nama) => {
    MySwal.fire({
      title: nama,
      imageUrl: imageUrl || "/noavatar.png",
      imageAlt: `Foto ${nama}`,
      showCloseButton: true,
      showConfirmButton: false,
    });
  }, []);

  // Notification helper
  const showNotification = (icon, title, text) => {
    MySwal.fire({
      icon,
      title,
      text,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  if (isLoading) {
    return <div className={styles.loading}>Memuat data...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.search}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NISN, atau kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        {session?.user?.role === "admin" && (
          <Link href="/dashboard/siswa/tambahkan">
            <button className={styles.addButton}>
              <UserPlus size={20} />
              Tambah Siswa
            </button>
          </Link>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nama</th>
              <th>NISN</th>
              <th>Kelas</th>
              <th>Alamat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredSiswa.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.noData}>
                  {searchTerm
                    ? "Tidak ada data yang sesuai dengan pencarian"
                    : "Belum ada data siswa"}
                </td>
              </tr>
            ) : (
              filteredSiswa.map((siswa) => (
                <tr
                  key={siswa._id}
                  onMouseEnter={() => setHoveredRow(siswa._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={hoveredRow === siswa._id ? styles.hoveredRow : ""}
                >
                  <td>
                    <Image
                      src={siswa.image || "/noavatar.png"}
                      alt={`Foto ${siswa.nama}`}
                      width={40}
                      height={40}
                      className={styles.userImage}
                      onClick={() =>
                        handleImagePreview(siswa.image, siswa.nama)
                      }
                    />
                  </td>
                  <td>{siswa.nama}</td>
                  <td>{siswa.nisn}</td>
                  <td>{siswa.kelas}</td>
                  <td>{siswa.alamat}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[siswa.status.toLowerCase()]
                      }`}
                    >
                      {siswa.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/dashboard/siswa/${siswa._id}`}>
                        <button className={`${styles.button} ${styles.edit}`}>
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(siswa._id)}
                        className={`${styles.button} ${styles.delete}`}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
