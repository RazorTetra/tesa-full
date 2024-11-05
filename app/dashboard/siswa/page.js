"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/master.module.css";

const MySwal = withReactContent(Swal);

export default function SiswaPage() {
  const [siswa, setSiswa] = useState([]);
  const [filteredSiswa, setFilteredSiswa] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const response = await fetch("/api/siswa");
        const data = await response.json();
        if (data.success) {
          setSiswa(data.data);
          setFilteredSiswa(data.data);
        } else {
          showError(data.error || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error mengambil data siswa:", error);
        showError("Error mengambil data siswa: " + error.message);
      }
    };
    fetchSiswa();
  }, []);

  useEffect(() => {
    const results = siswa.filter((s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredSiswa(results);
  }, [searchTerm, siswa]);

  const handleDelete = useCallback(async (id) => {
    const result = await MySwal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda tidak akan dapat mengembalikan ini!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
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
            prevFiltered.filter((s) => s._id !== id),
          );
          showSuccess("Siswa berhasil dihapus!");
        } else {
          showError(data.error || "Gagal menghapus siswa");
        }
      } catch (error) {
        console.error("Error menghapus siswa:", error);
        showError("Error menghapus siswa: " + error.message);
      }
    }
  }, []);

  const handleImageClick = (imageUrl, name) => {
    MySwal.fire({
      title: name,
      imageUrl: imageUrl,
      imageAlt: "Foto siswa",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "custom-swal",
      },
    });
  };

  const showError = (message) => {
    MySwal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
    });
  };

  const showSuccess = (message) => {
    MySwal.fire({
      icon: "success",
      title: "Berhasil!",
      text: message,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.search}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari siswa..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Link href="/dashboard/siswa/tambahkan">
          <button className={styles.addButton}>
            <UserPlus className={styles.addIcon} />
            Tambahkan
          </button>
        </Link>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>NISN</th>
              <th>Kelas</th>
              <th>Alamat</th>
              <th>Status</th>
              <th>Operasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredSiswa.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  Tidak ada data siswa yang tersedia.
                </td>
              </tr>
            ) : (
              filteredSiswa.map((s, index) => (
                <tr
                  key={s._id}
                  className={`${styles.tableRow} ${hoveredRow === index ? styles.hovered : ""}`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td>
                    <div className={styles.user}>
                      <Image
                        src={s.image || "/noavatar.png"}
                        alt={s.nama}
                        width={40}
                        height={40}
                        className={styles.userImage}
                        onClick={() =>
                          handleImageClick(s.image || "/noavatar.png", s.nama)
                        }
                      />
                      <span className={styles.userName}>{s.nama}</span>
                    </div>
                  </td>
                  <td>{s.nisn}</td>
                  <td>{s.kelas}</td>
                  <td>{s.alamat}</td>
                  <td>{s.status}</td>
                  <td>
                    <div className={styles.buttons}>
                      <Link href={`/dashboard/siswa/${s._id}`}>
                        <button className={`${styles.button} ${styles.view}`}>
                          Edit
                        </button>
                      </Link>
                      <button
                        className={`${styles.button} ${styles.delete}`}
                        onClick={() => handleDelete(s._id)}
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
