// app/dashboard/guru/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useSession } from "next-auth/react";
import styles from "@/app/ui/dashboard/master/master.module.css";

const MySwal = withReactContent(Swal);

const GuruPage = () => {
  const { data: session } = useSession();
  const [guru, setGuru] = useState([]);
  const [filteredGuru, setFilteredGuru] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data guru
  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const response = await fetch("/api/guru");
        const data = await response.json();

        if (data.success) {
          setGuru(data.data);
          setFilteredGuru(data.data);
        } else {
          showNotification("error", "Gagal mengambil data guru", data.error);
        }
      } catch (error) {
        showNotification(
          "error",
          "Error",
          "Terjadi kesalahan saat mengambil data guru"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuru();
  }, []);

  // Filter guru berdasarkan pencarian
  useEffect(() => {
    const results = guru.filter(
      (g) =>
        g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.nip.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGuru(results);
  }, [searchTerm, guru]);

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
            placeholder="Cari berdasarkan nama atau NIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        {session?.user?.role === "admin" && (
          <Link href="/dashboard/guru/tambahkan">
            <button className={styles.addButton}>
              <UserPlus size={20} />
              Tambah Guru
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
              <th>NIP</th>
              <th>No. Telepon</th>
              <th>Agama</th>
              <th>Alamat</th>
              {session?.user?.role === "admin" && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filteredGuru.length === 0 ? (
              <tr>
                <td colSpan={session?.user?.role === "admin" ? "7" : "6"} className={styles.noData}>
                  {searchTerm
                    ? "Tidak ada data yang sesuai dengan pencarian"
                    : "Belum ada data guru"}
                </td>
              </tr>
            ) : (
              filteredGuru.map((guru) => (
                <tr
                  key={guru._id}
                  onMouseEnter={() => setHoveredRow(guru._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={hoveredRow === guru._id ? styles.hoveredRow : ""}
                >
                  <td>
                    <Image
                      src={guru.image || "/noavatar.png"}
                      alt={`Foto ${guru.nama}`}
                      width={40}
                      height={40}
                      className={styles.userImage}
                      onClick={() =>
                        handleImagePreview(guru.image, guru.nama)
                      }
                    />
                  </td>
                  <td>{guru.nama}</td>
                  <td>{guru.nip}</td>
                  <td>{guru.nomorTlp}</td>
                  <td>{guru.agama}</td>
                  <td>{guru.alamat}</td>
                  {session?.user?.role === "admin" && (
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/dashboard/guru/${guru._id}`}>
                          <button className={`${styles.button} ${styles.edit}`}>
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(guru._id)}
                          className={`${styles.button} ${styles.delete}`}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuruPage;