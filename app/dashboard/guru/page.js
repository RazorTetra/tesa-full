"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/master.module.css";

const MySwal = withReactContent(Swal);

const GuruPage = () => {
  const [guru, setGuru] = useState([]);
  const [filteredGuru, setFilteredGuru] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const response = await fetch("/api/guru");
        const data = await response.json();
        if (data.success) {
          setGuru(data.data);
          setFilteredGuru(data.data);
        } else {
          showError(data.error || "Gagal mengambil data");
        }
      } catch (error) {
        console.error("Error mengambil data guru:", error);
        showError("Error mengambil data guru: " + error.message);
      }
    };
    fetchGuru();
  }, []);

  useEffect(() => {
    const results = guru.filter((g) =>
      g.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGuru(results);
  }, [searchTerm, guru]);

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
        const response = await fetch(`/api/guru/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          setGuru((prevGuru) => prevGuru.filter((g) => g._id !== id));
          setFilteredGuru((prevFiltered) =>
            prevFiltered.filter((g) => g._id !== id)
          );
          showSuccess("Guru berhasil dihapus!");
        } else {
          showError(data.error || "Gagal menghapus guru");
        }
      } catch (error) {
        console.error("Error menghapus guru:", error);
        showError("Error menghapus guru: " + error.message);
      }
    }
  }, []);

  const handleImageClick = (imageUrl, name) => {
    MySwal.fire({
      title: name,
      imageUrl: imageUrl,
      imageAlt: "Foto guru",
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
            placeholder="Cari guru..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Link href="/dashboard/guru/tambahkan">
          <button className={`${styles.addButton} ${styles.fadeIn}`}>
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
              <th>NIP</th>
              <th>No. Tlp</th>
              <th>Agama</th>
              <th>Alamat</th>
              <th>Operasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuru.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  Tidak ada data guru yang tersedia.
                </td>
              </tr>
            ) : (
              filteredGuru.map((g, index) => (
                <tr
                  key={g._id}
                  className={`${styles.tableRow} ${
                    hoveredRow === index ? styles.hovered : ""
                  }`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td>
                    <div className={styles.user}>
                      <Image
                        src={g.image || "/noavatar.png"}
                        alt=""
                        width={40}
                        height={40}
                        className={styles.userImage}
                        onClick={() =>
                          handleImageClick(g.image || "/noavatar.png", g.nama)
                        }
                      />
                      <span className={styles.userName}>{g.nama}</span>
                    </div>
                  </td>
                  <td>{g.nip}</td>
                  <td>{g.nomorTlp}</td>
                  <td>{g.agama}</td>
                  <td>{g.alamat}</td>
                  <td>
                    <div className={styles.buttons}>
                      <Link href={`/dashboard/guru/${g._id}`}>
                        <button className={`${styles.button} ${styles.view}`}>
                          Edit
                        </button>
                      </Link>
                      <button
                        className={`${styles.button} ${styles.delete}`}
                        onClick={() => handleDelete(g._id)}
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
};

export default GuruPage;
