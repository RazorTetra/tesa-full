"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import styles from "@/app/ui/dashboard/master/master.module.css";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const MutasiMasukPage = () => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mutasiMasuk, setMutasiMasuk] = useState([]);
  const [filteredMutasi, setFilteredMutasi] = useState(mutasiMasuk);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMutasiMasuk = async () => {
      try {
        const response = await fetch("/api/siswaMutasiMasuk");
        const data = await response.json();
        if (data.success) {
          setMutasiMasuk(data.data);
          setFilteredMutasi(data.data);
        } else {
          setError(data.error || "Gagal mengambil data mutasi masuk");
        }
      } catch (error) {
        console.error("Error fetching mutasi masuk:", error);
        setError("Error fetching mutasi masuk: " + error.message);
      }
    };
    fetchMutasiMasuk();
  }, []);

  useEffect(() => {
    const results = mutasiMasuk.filter((m) =>
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredMutasi(results);
  }, [searchTerm, mutasiMasuk]);

  const handleDelete = async (id) => {
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
        const response = await fetch(`/api/siswaMutasiMasuk`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id }), 
        });
        const data = await response.json();
        if (data.success) {
          setMutasiMasuk((prev) => prev.filter((m) => m._id !== id));
          setFilteredMutasi((prev) => prev.filter((m) => m._id !== id));
          MySwal.fire("Dihapus!", "Data siswa telah dihapus.", "success");
        } else {
          MySwal.fire("Error!", data.error || "Gagal menghapus data", "error");
        }
      } catch (error) {
        console.error("Error deleting mutasi masuk:", error);
        MySwal.fire(
          "Error!",
          "Error deleting mutasi masuk: " + error.message,
          "error",
        );
      }
    }
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Cari siswa..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Link href="/dashboard/mutasi/masuk/tambahkan">
          <button className={styles.addButton}>Tambahkan</button>
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
              <th>Masuk</th>
              <th>Operasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredMutasi.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  Tidak ada data siswa yang tersedia.
                </td>
              </tr>
            ) : (
              filteredMutasi.map((m, index) => (
                <tr
                  key={m._id}
                  className={styles.tableRow}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td>
                    <div className={styles.user}>
                      <Image
                        src={m.image || "/noavatar.png"}
                        alt=""
                        width={40}
                        height={40}
                        className={styles.userImage}
                      />
                      <span className={styles.userName}>{m.nama}</span>
                    </div>
                  </td>
                  <td>{m.nisn}</td>
                  <td>{m.kelas}</td>
                  <td>{m.alamat}</td>
                  <td>
                    {m.tanggalMasuk
                      ? format(new Date(m.tanggalMasuk), "dd MMMM yyyy")
                      : "-"}
                  </td>
                  <td>
                    <button
                      className={`${styles.button} ${styles.delete}`}
                      onClick={() => handleDelete(m._id)}
                    >
                      Hapus
                    </button>
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

export default MutasiMasukPage;
