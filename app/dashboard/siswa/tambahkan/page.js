// app/dashboard/siswa/tambahkan/page.js
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const MySwal = withReactContent(Swal);

const AddSiswaPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    nisn: "",
    alamat: "",
    status: "",
    kelas: "",
    image: "/noavatar.png",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "nisn") {
      // Hanya menerima angka dan maksimal 10 digit
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      MySwal.fire({
        icon: "error",
        title: "File Terlalu Besar",
        text: "Ukuran file maksimal 2MB",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      MySwal.fire({
        icon: "error",
        title: "Format File Salah",
        text: "Mohon upload file gambar (JPG, PNG, etc)",
      });
      return;
    }

    setIsImageUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", "siswa");
      formData.append("entityId", `temp_${Date.now()}`);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          image: data.fileName,
        }));
        setImageError(false);
        MySwal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Foto berhasil diupload",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.error || "Gagal upload gambar");
      }
    } catch (error) {
      console.error("Upload error:", error);
      MySwal.fire({
        icon: "error",
        title: "Gagal Upload",
        text: error.message,
      });
      setImageError(true);
    } finally {
      setIsImageUploading(false);
    }
  }, []);
  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama harus diisi";
    }

    if (!formData.nisn) {
      newErrors.nisn = "NISN harus diisi";
    } else if (formData.nisn.length !== 10) {
      newErrors.nisn = "NISN harus 10 digit";
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat harus diisi";
    }

    if (!formData.status) {
      newErrors.status = "Status harus dipilih";
    }

    if (!formData.kelas) {
      newErrors.kelas = "Kelas harus dipilih";
    }

    return newErrors;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      MySwal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Mohon lengkapi semua field yang diperlukan",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await MySwal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data siswa berhasil ditambahkan",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push("/dashboard/siswa");
        router.refresh();
      } else {
        throw new Error(data.error || "Gagal menambahkan data siswa");
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.container} ${styles.fadeIn}`}>
      <div className={styles.infoContainer}>
        <div
          className={`${styles.imgContainer} ${
            isImageUploading ? styles.uploading : ""
          }`}
          onClick={() =>
            !isImageUploading && document.getElementById("file-input").click()
          }
          style={{ cursor: isImageUploading ? "wait" : "pointer" }}
        >
          <Image
            src={formData.image}
            width={200}
            height={200}
            alt="Foto Siswa"
            className={styles.avatar}
            priority
          />
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
            disabled={isImageUploading}
          />
          {isImageUploading && (
            <div className={styles.uploadingOverlay}>
              <span>Mengupload...</span>
            </div>
          )}
        </div>
        <p className={styles.description}>
          {isImageUploading
            ? "Mengupload foto..."
            : "Klik gambar di atas untuk menambahkan foto profil"}
        </p>
        {imageError && (
          <p className={styles.errorText}>
            Gagal memuat gambar. Silakan coba upload ulang.
          </p>
        )}
      </div>

      <div className={`${styles.formContainer} ${styles.fadeIn}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="nama">Nama Lengkap</label>
            <input
              id="nama"
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className={errors.nama ? styles.inputError : styles.input}
              placeholder="Masukkan nama lengkap"
              disabled={isSubmitting}
            />
            {errors.nama && <span className={styles.error}>{errors.nama}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="nisn">NISN</label>
            <input
              id="nisn"
              type="text"
              name="nisn"
              value={formData.nisn}
              onChange={handleChange}
              className={errors.nisn ? styles.inputError : styles.input}
              placeholder="Masukkan 10 digit NISN"
              maxLength={10}
              disabled={isSubmitting}
            />
            {errors.nisn && <span className={styles.error}>{errors.nisn}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="alamat">Alamat</label>
            <input
              id="alamat"
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className={errors.alamat ? styles.inputError : styles.input}
              placeholder="Masukkan alamat lengkap"
              disabled={isSubmitting}
            />
            {errors.alamat && (
              <span className={styles.error}>{errors.alamat}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={errors.status ? styles.selectError : styles.select}
              disabled={isSubmitting}
            >
              <option value="">Pilih Status</option>
              <option value="Siswa">Siswa</option>
              <option value="Siswa Baru">Siswa Baru</option>
              <option value="Siswa Pindah">Siswa Pindah</option>
              <option value="Siswa Pindahan">Siswa Pindahan</option>
            </select>
            {errors.status && (
              <span className={styles.error}>{errors.status}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="kelas">Kelas</label>
            <select
              id="kelas"
              name="kelas"
              value={formData.kelas}
              onChange={handleChange}
              className={errors.kelas ? styles.selectError : styles.select}
              disabled={isSubmitting}
            >
              <option value="">Pilih Kelas</option>
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

          <button
            type="submit"
            className={`${styles.button} ${styles.fadeIn}`}
            disabled={isSubmitting || isImageUploading}
          >
            <UserPlus size={20} />
            {isSubmitting ? "Menyimpan..." : "Simpan Data"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSiswaPage;
