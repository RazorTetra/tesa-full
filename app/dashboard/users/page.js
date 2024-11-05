"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/master.module.css";

const MySwal = withReactContent(Swal);

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Gagal mengambil data pengguna");
        }
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
          setFilteredUsers(data.data);
        } else {
          showError(data.error || "Gagal mengambil data pengguna");
        }
      } catch (error) {
        console.error("Error mengambil data pengguna:", error);
        showError("Error mengambil data pengguna: " + error.message);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(
      (u) => u.nama && u.nama.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleDelete = useCallback(
    async (id) => {
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
          const response = await fetch(`/api/user/${id}`, {
            method: "DELETE",
          });
          const data = await response.json();
          if (data.success) {
            setUsers((prevUsers) => prevUsers.filter((u) => u._id !== id));
            setFilteredUsers((prevFiltered) =>
              prevFiltered.filter((u) => u._id !== id),
            );
            showSuccess("Pengguna berhasil dihapus!");
          } else {
            showError(data.error || "Gagal menghapus pengguna");
          }
        } catch (error) {
          console.error("Error menghapus pengguna:", error);
          showError("Error menghapus pengguna: " + error.message);
        }
      }
    },
    [MySwal],
  );

  const handleImageClick = (imageUrl, name) => {
    MySwal.fire({
      title: name,
      imageUrl: imageUrl,
      imageAlt: "Foto pengguna",
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
            placeholder="Cari pengguna..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Link href="/dashboard/users/tambahkan">
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
              <th>Email</th>
              <th>Dibuat</th>
              <th>Pengguna</th>
              <th>Operasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  Tidak ada data pengguna yang tersedia.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, index) => (
                <tr
                  key={u._id}
                  className={`${styles.tableRow} ${hoveredRow === index ? styles.hovered : ""}`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td>
                    <div className={styles.user}>
                      <Image
                        src={u.image || "/noavatar.png"}
                        alt={u.nama || "Pengguna tanpa nama"}
                        width={40}
                        height={40}
                        className={styles.userImage}
                        onClick={() =>
                          handleImageClick(u.image || "/noavatar.png", u.nama)
                        }
                      />
                      <span className={styles.userName}>{u.nama}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>{u.pengguna}</td>
                  <td>
                    <div className={styles.buttons}>
                      <Link href={`/dashboard/users/${u._id}`}>
                        <button className={`${styles.button} ${styles.view}`}>
                          Edit
                        </button>
                      </Link>
                      <button
                        className={`${styles.button} ${styles.delete}`}
                        onClick={() => handleDelete(u._id)}
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
