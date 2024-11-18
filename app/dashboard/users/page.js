// app/dashboard/users/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/master.module.css";

const MySwal = withReactContent(Swal);
const ITEMS_PER_PAGE = 10;

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/user");
      if (!response.ok) {
        throw new Error("Gagal mengambil data pengguna");
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
        setTotalPages(Math.ceil(data.data.length / ITEMS_PER_PAGE));
      } else {
        showError(data.error || "Gagal mengambil data pengguna");
      }
    } catch (error) {
      console.error("Error mengambil data pengguna:", error);
      showError("Error mengambil data pengguna: " + error.message);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const results = users.filter(
      (u) => u.nama && u.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
    setCurrentPage(1);
    setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
  }, [searchTerm, users]);

  const handleDelete = async (id) => {
    try {
      const result = await MySwal.fire({
        title: "Anda yakin?",
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const response = await fetch(`/api/user/${id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          MySwal.fire(
            "Terhapus!",
            "Data pengguna berhasil dihapus.",
            "success"
          );
          fetchUsers(); // Refresh data
          router.refresh();
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      MySwal.fire(
        "Error!",
        `Gagal menghapus pengguna: ${error.message}`,
        "error"
      );
    }
  };

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

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const PaginationControls = ({ currentPage, totalPages, setCurrentPage }) => (
    <div className="flex items-center justify-center gap-4 mt-6 pb-4">
      <button
        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        disabled={currentPage === 1}
        className="flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm text-gray-600">
        Halaman {currentPage} dari {totalPages}
      </span>

      <button
        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

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
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  Tidak ada data pengguna yang tersedia.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u, index) => (
                <tr
                  key={u._id}
                  className={`${styles.tableRow} ${
                    hoveredRow === index ? styles.hovered : ""
                  }`}
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
        {filteredUsers.length > ITEMS_PER_PAGE && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}{" "}
      </div>
    </div>
  );
}
