"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";
import { UserPlus } from "lucide-react";

const AddSiswaMutasiKeluarPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    tanggalKeluar: "",
    nomorSurat: "",
    nisn: "",
    nama: "",
    tujuanSekolah: "",
    kelas: "",
    alamat: "",
    alasan: "",
    image: "",
  });

  const [image, setImage] = useState("/noavatar.png");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nisn") {
      if (/^\d*$/.test(value)) {
        setFormData((prevState) => ({ ...prevState, [name]: value }));
      }
      return;
    }
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          setImage(data.fileName);
        } else {
          console.error("Gagal upload gambar:", data.error);
        }
      } catch (error) {
        console.error("Terjadi kesalahan saat mengupload gambar:", error);
      }
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.nama) errors.nama = "Nama harus diisi";
    if (!formData.nisn) errors.nisn = "NISN harus diisi";
    if (!formData.alamat) errors.alamat = "Alamat harus diisi";
    if (!formData.tujuanSekolah)
      errors.tujuanSekolah = "Tujuan Sekolah harus diisi";
    if (!formData.kelas) errors.kelas = "Kelas harus dipilih";
    if (!formData.tanggalKeluar)
      errors.tanggalKeluar = "Tanggal Keluar harus diisi";
    if (!formData.nomorSurat) errors.nomorSurat = "Nomor Surat harus diisi";
    if (!formData.alasan) errors.alasan = "Alasan harus diisi";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/siswaMutasiKeluar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, image }),
        });
        const data = await response.json();
        if (data.success) {
          alert("Siswa mutasi keluar berhasil ditambahkan!");
          setFormData({
            tanggalKeluar: "",
            nomorSurat: "",
            nisn: "",
            nama: "",
            tujuanSekolah: "",
            kelas: "",
            alamat: "",
            alasan: "",
            image: "",
          });
          setImage("/noavatar.png");
          router.push("/dashboard/mutasi/keluar");
        } else {
          setErrors({
            submit:
              data.error || "Terjadi kesalahan saat menambahkan siswa mutasi",
          });
        }
      } catch (error) {
        setErrors({
          submit: "Terjadi kesalahan saat menambahkan siswa mutasi",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className={`${styles.container} ${styles.fadeIn}`}>
      <div className={styles.infoContainer}>
        <div
          className={`${styles.imgContainer} ${styles.fadeIn}`}
          onClick={() => document.getElementById("file-input").click()}
        >
          <Image
            src={image}
            alt="Siswa Avatar"
            sizes="(max-width: 768px) 100vw, 33vw"
            fill
            className={styles.avatar}
          />
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
        <p className={styles.description}>
          Klik gambar di atas untuk menambahkan foto profil
        </p>
      </div>
      <div className={`${styles.formContainer} ${styles.fadeIn}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="tanggalKeluar" className={styles.label}>
              Tanggal Keluar
            </label>
            <input
              id="tanggalKeluar"
              type="date"
              name="tanggalKeluar"
              onChange={handleChange}
              value={formData.tanggalKeluar}
              className={styles.input}
            />
            {errors.tanggalKeluar && (
              <span className={styles.error}>{errors.tanggalKeluar}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="nomorSurat" className={styles.label}>
              Nomor Surat
            </label>
            <input
              id="nomorSurat"
              type="text"
              name="nomorSurat"
              onChange={handleChange}
              value={formData.nomorSurat}
              className={styles.input}
            />
            {errors.nomorSurat && (
              <span className={styles.error}>{errors.nomorSurat}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="nama" className={styles.label}>
              Nama
            </label>
            <input
              id="nama"
              type="text"
              name="nama"
              onChange={handleChange}
              value={formData.nama}
              className={styles.input}
            />
            {errors.nama && <span className={styles.error}>{errors.nama}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="nisn" className={styles.label}>
              NISN
            </label>
            <input
              id="nisn"
              type="text"
              name="nisn"
              onChange={handleChange}
              value={formData.nisn}
              className={styles.input}
            />
            {errors.nisn && <span className={styles.error}>{errors.nisn}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="tujuanSekolah" className={styles.label}>
              Tujuan Sekolah
            </label>
            <input
              id="tujuanSekolah"
              type="text"
              name="tujuanSekolah"
              onChange={handleChange}
              value={formData.tujuanSekolah}
              className={styles.input}
            />
            {errors.tujuanSekolah && (
              <span className={styles.error}>{errors.tujuanSekolah}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="alamat" className={styles.label}>
              Alamat
            </label>
            <input
              id="alamat"
              type="text"
              name="alamat"
              onChange={handleChange}
              value={formData.alamat}
              className={styles.input}
            />
            {errors.alamat && (
              <span className={styles.error}>{errors.alamat}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="kelas" className={styles.label}>
              Kelas
            </label>
            <select
              id="kelas"
              name="kelas"
              onChange={handleChange}
              value={formData.kelas}
              className={styles.select}
            >
              <option value="" disabled>
                Pilih Kelas
              </option>
              <option value="VII A">VII A</option>
              <option value="VII B">VII B</option>
              <option value="VIII A">VIII A</option>
              <option value="VIII B">VIII B</option>
              <option value="IX A">IX A</option>
              <option value="IX B">IX B</option>
            </select>
            {errors.kelas && (
              <span className={styles.error}>{errors.kelas}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="alasan" className={styles.label}>
              Alasan
            </label>
            <input
              id="alasan"
              type="text"
              name="alasan"
              onChange={handleChange}
              value={formData.alasan}
              className={styles.input}
            />
            {errors.alasan && (
              <span className={styles.error}>{errors.alasan}</span>
            )}
          </div>
          <button
            type="submit"
            className={`${styles.button} ${isSubmitting ? styles.loading : ""}`}
            disabled={isSubmitting}
          >
            <UserPlus />{" "}
            {isSubmitting ? "Menambahkan..." : "Tambah Siswa Mutasi"}
          </button>
          {errors.submit && (
            <span className={styles.error}>{errors.submit}</span>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddSiswaMutasiKeluarPage;
