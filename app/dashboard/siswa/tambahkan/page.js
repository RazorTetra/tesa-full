"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const AddSiswaPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    nisn: "",
    alamat: "",
    status: "",
    kelas: "",
    image: "",
  });
  const [image, setImage] = useState("/noavatar.png");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nisn" || name === "telepon") {
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
    if (!formData.status) errors.status = "Status harus dipilih";
    if (!formData.kelas) errors.kelas = "Kelas harus dipilih";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/siswa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, image }),
        });
        const data = await response.json();
        if (data.success) {
          alert("Siswa berhasil ditambahkan!");
          setFormData({
            nama: "",
            nisn: "",
            alamat: "",
            status: "",
            kelas: "",
            image: "",
          });
          setImage("/noavatar.png");
          router.push("/dashboard/siswa");
        } else {
          setErrors({
            submit: data.error || "Terjadi kesalahan saat menambahkan siswa",
          });
        }
      } catch (error) {
        setErrors({ submit: "Terjadi kesalahan saat menambahkan siswa" });
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
              type="tel"
              name="nisn"
              onChange={handleChange}
              value={formData.nisn}
              className={styles.input}
              maxLength={15}
            />
            {errors.nisn && <span className={styles.error}>{errors.nisn}</span>}
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
            <label htmlFor="status" className={styles.label}>
              Status
            </label>
            <select
              id="status"
              name="status"
              onChange={handleChange}
              value={formData.status}
              className={styles.select}
            >
              <option value="" disabled>
                Pilih Status
              </option>
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
          {errors.submit && (
            <span className={styles.error}>{errors.submit}</span>
          )}
          <button
            type="submit"
            className={`${styles.button} ${styles.fadeIn}`}
            disabled={isSubmitting}
          >
            <UserPlus className={styles.icon} />
            {isSubmitting ? "Menambahkan..." : "Tambahkan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSiswaPage;
