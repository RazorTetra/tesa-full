"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";
import Swal from "sweetalert2";

const SingleSiswaPage = () => {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    nama: "",
    nisn: "",
    alamat: "",
    status: "",
    kelas: "",
  });
  const [image, setImage] = useState("/noavatar.png");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const { id } = params;
        const response = await fetch(`/api/siswa/${id}`);
        const data = await response.json();
        if (data.success) {
          setFormData(data.data);
          setImage(data.data.image || "/noavatar.png");
        } else {
          console.error("Error fetching siswa:", data.error);
        }
      } catch (error) {
        console.error("Error fetching siswa:", error);
      }
    };
    fetchSiswa();
  }, [params]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleNisnChange = (e) => {
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
      try {
        const response = await fetch(`/api/siswa/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, image }),
        });
        const data = await response.json();
        if (data.success) {
          Swal.fire({
            title: "Apakah kamu ingin menyimpan perubahan?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Ya, simpan",
            denyButtonText: `Tidak, batalkan`,
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire("Saved!", "", "success").then(() => {
                router.push("/dashboard/siswa");
              });
            } else if (result.isDenied) {
              Swal.fire("Changes are not saved", "", "info");
            }
          });
        } else {
          setErrors({ submit: data.error });
        }
      } catch (error) {
        setErrors({ submit: "Terjadi kesalahan saat mengedit siswa" });
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
          <Image src={image} alt="Siswa Avatar" fill />
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
            <label className={styles.label}>NISN</label>
            <input
              type="text"
              name="nisn"
              value={formData.nisn}
              onKeyPress={(e) => {
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={handleNisnChange}
              className={styles.input}
            />
            {errors.nisn && <span className={styles.error}>{errors.nisn}</span>}
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
          <div className={styles.inputGroup}>
            <label className={styles.label}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
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
            <label className={styles.label}>Kelas</label>
            <select
              name="kelas"
              value={formData.kelas}
              onChange={handleChange}
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
          <button type="submit" className={styles.button}>
            Selesai
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleSiswaPage;
