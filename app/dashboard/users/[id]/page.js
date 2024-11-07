// app/dashboard/users/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const MySwal = withReactContent(Swal);

const SingleUserPage = () => {
  const router = useRouter();
  const params = useParams();
  const [userData, setUserData] = useState(null);
  const [image, setImage] = useState("/noavatar.png");
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    phone: "",
    pengguna: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!params?.id) return;

      try {
        const response = await fetch(`/api/user/${params.id}`);
        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}`
          );
        }
        
        const data = await response.json();
        
        if (data.success) {
          setUserData(data.data);
          setFormData({
            nama: data.data.nama || "",
            email: data.data.email || "",
            phone: data.data.phone || "",
            pengguna: data.data.pengguna || "",
          });
          setImage(data.data.image || "/noavatar.png");
        } else {
          throw new Error(data.error || "Gagal mengambil data user");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        MySwal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Gagal mengambil data user. " + error.message,
        }).then(() => {
          router.push("/dashboard/users");
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [params?.id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, phone: value }));
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  const handleImageUpload = async (e) => {
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

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", "users");
      formData.append("entityId", params.id);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setImage(data.fileName);
        MySwal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Foto berhasil diupload",
          timer: 1500,
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
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama) newErrors.nama = "Nama harus diisi";
    if (!formData.email) newErrors.email = "Email harus diisi";
    if (!formData.phone) newErrors.phone = "No. telp harus diisi";
    if (!formData.pengguna) newErrors.pengguna = "Pengguna harus dipilih";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/user/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await MySwal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil diperbarui!",
          timer: 1500,
        });
        router.push("/dashboard/users");
        router.refresh();
      } else {
        throw new Error(data.error || "Gagal memperbarui data");
      }
    } catch (error) {
      console.error("Update error:", error);
      MySwal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Memuat data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image 
            src={image} 
            alt="User Avatar" 
            width={200} 
            height={200} 
            className={styles.avatar}
            onClick={() => document.getElementById("file-input").click()}
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
          Klik gambar di atas untuk mengubah foto profil...
        </p>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nama</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className={errors.nama ? styles.inputError : styles.input}
              disabled={isSubmitting}
            />
            {errors.nama && <span className={styles.error}>{errors.nama}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? styles.inputError : styles.input}
              disabled={isSubmitting}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>No. telp</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={errors.phone ? styles.inputError : styles.input}
              disabled={isSubmitting}
            />
            {errors.phone && <span className={styles.error}>{errors.phone}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Pengguna</label>
            <select
              name="pengguna"
              value={formData.pengguna}
              onChange={handleChange}
              className={errors.pengguna ? styles.selectError : styles.select}
              disabled={isSubmitting}
            >
              <option value="" disabled>Pilih Pengguna</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            {errors.pengguna && <span className={styles.error}>{errors.pengguna}</span>}
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memperbarui..." : "Perbarui"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleUserPage;