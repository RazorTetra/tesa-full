// app/dashboard/guru/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { UserCog } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const MySwal = withReactContent(Swal);

const EditGuruPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    nomorTlp: "",
    agama: "",
    alamat: "",
    image: "/noavatar.png",
    imagePublicId: "", // untuk cloudinary
  });
  const [errors, setErrors] = useState({});

  // Redirect jika bukan admin
  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/dashboard/guru");
    }
  }, [session, router]);

  // Fetch guru data
  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const response = await fetch(`/api/guru/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setFormData({
            ...data.data,
            image: data.data.image || "/noavatar.png",
            imagePublicId: data.data.imagePublicId || ""
          });
        } else {
          throw new Error(data.error || "Failed to fetch guru data");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal mengambil data guru",
        });
        router.push("/dashboard/guru");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.role === "admin") {
      fetchGuru();
    }
  }, [params.id, session, router]);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "nip" || name === "nomorTlp") {
      if (/^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handle image upload ke Cloudinary
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
      // Hapus gambar lama dari Cloudinary jika ada
      if (formData.imagePublicId && formData.imagePublicId !== "tesa_skripsi/defaults/no-avatar") {
        try {
          await fetch("/api/upload/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publicId: formData.imagePublicId,
            }),
          });
        } catch (error) {
          console.warn("Error deleting old image:", error);
        }
      }

      // Upload gambar baru ke Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("entityType", "guru");
      uploadFormData.append("entityId", params.id);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          image: data.fileName,
          imagePublicId: data.publicId,
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
  }, [params.id, formData.imagePublicId]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama harus diisi";
    }

    if (!formData.nip) {
      newErrors.nip = "NIP harus diisi";
    }

    if (!formData.nomorTlp) {
      newErrors.nomorTlp = "Nomor telepon harus diisi";
    }

    if (!formData.agama) {
      newErrors.agama = "Agama harus dipilih";
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat harus diisi";
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

    const result = await MySwal.fire({
      title: "Apakah anda yakin?",
      text: "Data guru akan diperbarui",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, perbarui",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/guru/${params.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
          await MySwal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data guru berhasil diperbarui",
            timer: 2000,
            showConfirmButton: false,
          });
          router.push("/dashboard/guru");
          router.refresh();
        } else {
          throw new Error(data.error || "Gagal memperbarui data guru");
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
    }
  };

  if (session?.user?.role !== "admin") {
    return null;
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={`${styles.container} ${styles.fadeIn}`}>
      <div className={styles.infoContainer}>
        <div
          className={`${styles.imgContainer} ${
            isImageUploading ? styles.uploading : ""
          }`}
          onClick={() => !isImageUploading && document.getElementById("file-input").click()}
          style={{ cursor: isImageUploading ? "wait" : "pointer" }}
        >
          <Image
            src={formData.image}
            alt="Foto Guru"
            width={200}
            height={200}
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
            : "Klik gambar di atas untuk mengubah foto profil"}
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
            <label htmlFor="nip">NIP</label>
            <input
              id="nip"
              type="text"
              name="nip"
              value={formData.nip}
              onChange={handleChange}
              className={errors.nip ? styles.inputError : styles.input}
              placeholder="Masukkan NIP"
              disabled={isSubmitting}
            />
            {errors.nip && <span className={styles.error}>{errors.nip}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="nomorTlp">Nomor Telepon</label>
            <input
              id="nomorTlp"
              type="text"
              name="nomorTlp"
              value={formData.nomorTlp}
              onChange={handleChange}
              className={errors.nomorTlp ? styles.inputError : styles.input}
              placeholder="Masukkan nomor telepon"
              disabled={isSubmitting}
            />
            {errors.nomorTlp && (
              <span className={styles.error}>{errors.nomorTlp}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="agama">Agama</label>
            <select
              id="agama"
              name="agama"
              value={formData.agama}
              onChange={handleChange}
              className={errors.agama ? styles.selectError : styles.select}
              disabled={isSubmitting}
            >
              <option value="">Pilih Agama</option>
              <option value="Kristen">Kristen</option>
              <option value="Islam">Islam</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddha">Buddha</option>
              <option value="Konghucu">Konghucu</option>
            </select>
            {errors.agama && <span className={styles.error}>{errors.agama}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="alamat">Alamat</label>
            <textarea
              id="alamat"
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

          <button
            type="submit"
            className={`${styles.button} ${styles.fadeIn}`}
            disabled={isSubmitting || isImageUploading}
          >
            <UserCog size={20} />
            {isSubmitting ? "Menyimpan..." : "Update Data"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditGuruPage;