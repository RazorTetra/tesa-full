"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const MySwal = withReactContent(Swal);

const SingleUserPage = ({ params }) => {
  const router = useRouter();
  const { id } = params;
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${id}`);
        const data = await response.json();
        if (data.success) {
          setUserData(data.data);
          setFormData({
            nama: data.data.nama,
            email: data.data.email,
            phone: data.data.phone,
            pengguna: data.data.pengguna,
          });
          setImage(data.data.image || "/noavatar.png");
        } else {
          MySwal.fire({
            icon: "error",
            title: "Gagal!",
            text: data.error || "Tidak dapat mengambil data pengguna.",
          });
        }
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Terjadi kesalahan saat mengambil data pengguna.",
        });
      }
    };
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.nama) errors.nama = "Nama harus diisi";
    if (!formData.email) errors.email = "Email harus diisi";
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
        const response = await fetch(`/api/user/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, image }),
        });
        const data = await response.json();
        if (data.success) {
          MySwal.fire({
            title: "Berhasil!",
            text: "Data pengguna berhasil diperbarui!",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            router.push("/dashboard/users");
          });
        } else {
          setErrors({
            submit: data.error || "Terjadi kesalahan saat memperbarui pengguna",
          });
        }
      } catch (error) {
        setErrors({ submit: "Terjadi kesalahan saat memperbarui pengguna" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  if (!userData) return <p>Loading...</p>;

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
              onChange={handleChange}
              value={formData.nama}
              className={styles.input}
            />
            {errors.nama && <span className={styles.error}>{errors.nama}</span>}
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
            <label className={styles.label}>No. telp</label>
            <input
              type="tel"
              name="phone"
              onKeyPress={(e) => {
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={handlePhoneChange}
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
            {isSubmitting ? "Memperbarui..." : "Perbarui"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleUserPage;
