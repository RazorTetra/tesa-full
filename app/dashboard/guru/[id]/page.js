"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const SingleGuruPage = () => {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    nomorTlp: "",
    agama: "",
    alamat: "",
  });
  const [image, setImage] = useState("/noavatar.png");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const { id } = await params; 
        const response = await fetch(`/api/guru/${id}`);
        const data = await response.json();
        if (data.success) {
          setFormData(data.data);
          setImage(data.data.image || "/noavatar.png");
        } else {
          console.error("Error fetching guru:", data.error);
        }
      } catch (error) {
        console.error("Error fetching guru:", error);
      }
    };
    fetchGuru();
  }, [params]);

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
      try {
        const { id } = await params; // Unwrap params di sini juga
        const response = await fetch(`/api/guru/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, image }),
        });
        const data = await response.json();
        if (data.success) {
          router.push("/dashboard/guru");
        } else {
          setErrors({ submit: data.error });
        }
      } catch (error) {
        setErrors({ submit: "Terjadi kesalahan saat mengedit guru" });
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
          <Image src={image} alt="Guru Avatar" fill />
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
        <p className={styles.description}>
          Klik gambar di atas untuk "mengedit" foto profil...
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
              className={styles.input}
            />
            {errors.nama && <span className={styles.error}>{errors.nama}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>NIP</label>
            <input
              type="tel"
              name="nip"
              value={formData.nip}
              onKeyPress={(e) => {
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.nip && <span className={styles.error}>{errors.nip}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nomor Telepon</label>
            <input
              type="tel"
              name="nomorTlp"
              value={formData.nomorTlp}
              onKeyPress={(e) => {
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={handlePhoneChange}
              className={styles.input}
            />
            {errors.nomorTlp && (
              <span className={styles.error}>{errors.nomorTlp}</span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Agama</label>
            <select
              name="agama"
              value={formData.agama}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="" disabled>
                Pilih Agama
              </option>
              <option value="Kristen">Kristen</option>
              <option value="Islam">Islam</option>
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
            <label className={styles.label}>Alamat</label>
            <input
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className={styles.input}
            />
            {errors.alamat && (
              <span className={styles.error}>{errors.alamat}</span>
            )}
          </div>
          {errors.submit && (
            <span className={styles.error}>{errors.submit}</span>
          )}
          <button type="submit" className={styles.button}>
            Selesai
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleGuruPage;
