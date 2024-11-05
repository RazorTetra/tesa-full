"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    pengguna: "",
  });
  const [image, setImage] = useState("/noavatar.png");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
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
    if (!formData.username) errors.username = "Username harus diisi";
    if (!formData.email) errors.email = "Email harus diisi";
    if (!formData.password) errors.password = "Password harus diisi";
    if (!formData.phone) errors.phone = "No. telp harus diisi";
    if (!formData.pengguna) errors.pengguna = "Pengguna harus dipilih";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, image }),
        });
        const data = await response.json();
        if (data.success) {
          alert("User berhasil ditambahkan!");
          setFormData({
            nama: "",
            username: "",
            email: "",
            password: "",
            phone: "",
            pengguna: "",
          });
          setImage("/noavatar.png");
          router.push("/dashboard/users");
        } else {
          setErrors({
            submit: data.error || "Terjadi kesalahan saat menambahkan pengguna",
          });
        }
      } catch (error) {
        setErrors({ submit: "Terjadi kesalahan saat menambahkan pengguna" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div
          className={styles.imgContainer}
          onClick={() => document.getElementById("file-input").click()}
        >
          <Image src={image} alt="User Avatar" fill />
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
        <p className={styles.description}>
          Klik gambar di atas untuk menambahkan foto profil...
        </p>
      </div>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nama</label>
            <input
              type="text"
              name="nama"
              onChange={handleChange}
              value={formData.nama}
              className={styles.input}
            />
            {errors.nama && <span className={styles.error}>{errors.nama}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              onChange={handleChange}
              value={formData.username}
              className={styles.input}
            />
            {errors.username && (
              <span className={styles.error}>{errors.username}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              className={styles.input}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={formData.password}
              className={styles.input}
            />
            {errors.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>No. telp</label>
            <input
              type="tel"
              name="phone"
              onChange={handleChange}
              value={formData.phone}
              className={styles.input}
            />
            {errors.phone && (
              <span className={styles.error}>{errors.phone}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Pengguna</label>
            <select
              name="pengguna"
              onChange={handleChange}
              value={formData.pengguna}
              className={styles.select}
            >
              <option value="" disabled>
                Pilih Pengguna
              </option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            {errors.pengguna && (
              <span className={styles.error}>{errors.pengguna}</span>
            )}
          </div>
          {errors.submit && (
            <span className={styles.error}>{errors.submit}</span>
          )}
          <button
            type="submit"
            className={styles.button}
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

export default AddUserPage;
