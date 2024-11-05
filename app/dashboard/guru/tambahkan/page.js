"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const AddGuruPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    nomorTlp: "",
    agama: "",
    alamat: "",
    image: "",
  });
  const [image, setImage] = useState("/noavatar.png");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nip" || name === "nomorTlp") {
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
    if (!formData.nip) errors.nip = "NIP harus diisi";
    if (!formData.nomorTlp) errors.nomorTlp = "Nomor telepon harus diisi";
    if (!formData.agama) errors.agama = "Agama harus dipilih";
    if (!formData.alamat) errors.alamat = "Alamat harus diisi";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/guru", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, image }),
        });
        const data = await response.json();
        if (data.success) {
          alert("Guru berhasil ditambahkan!");
          setFormData({
            nama: "",
            nip: "",
            nomorTlp: "",
            agama: "",
            alamat: "",
            image: "",
          });
          setImage("/noavatar.png");
          router.push("/dashboard/guru");
        } else {
          setErrors({
            submit: data.error || "Terjadi kesalahan saat menambahkan guru",
          });
        }
      } catch (error) {
        setErrors({ submit: "Terjadi kesalahan saat menambahkan guru" });
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
          <Image src={image} alt="Guru Avatar" fill className={styles.avatar} />
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
            <label htmlFor="nip" className={styles.label}>
              NIP
            </label>
            <input
              id="nip"
              type="tel"
              name="nip"
              onChange={handleChange}
              value={formData.nip}
              className={styles.input}
            />
            {errors.nip && <span className={styles.error}>{errors.nip}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="nomorTlp" className={styles.label}>
              Nomor Telepon
            </label>
            <input
              id="nomorTlp"
              type="tel"
              name="nomorTlp"
              onChange={handleChange}
              value={formData.nomorTlp}
              className={styles.input}
            />
            {errors.nomorTlp && (
              <span className={styles.error}>{errors.nomorTlp}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="agama" className={styles.label}>
              Agama
            </label>
            <select
              id="agama"
              name="agama"
              onChange={handleChange}
              value={formData.agama}
              className={styles.input}
            >
              <option value="">Pilih agama</option>
              <option value="Islam">Kristen</option>
              <option value="Kristen">Islam</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddha">Buddha</option>
              <option value="Konghucu">Konghucu</option>
            </select>
            {errors.agama && (
              <span className={styles.error}>{errors.agama}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="alamat" className={styles.label}>
              Alamat
            </label>
            <textarea
              id="alamat"
              name="alamat"
              onChange={handleChange}
              value={formData.alamat}
              className={styles.input}
            />
            {errors.alamat && (
              <span className={styles.error}>{errors.alamat}</span>
            )}
          </div>
          <button
            type="submit"
            className={`${styles.button} ${styles.fadeIn}`}
            disabled={isSubmitting}
          >
            <UserPlus className={styles.icon} />
            {isSubmitting ? "Menambahkan..." : "Tambahkan"}
          </button>
          {errors.submit && (
            <span className={styles.error}>{errors.submit}</span>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddGuruPage;
