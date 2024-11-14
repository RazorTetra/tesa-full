// app/dashboard/siswa/[id]/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { UserCog, KeyRound } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import styles from "@/app/ui/dashboard/master/addEdit.module.css";

const MySwal = withReactContent(Swal);

const EditSiswaPage = () => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nama: "",
    nisn: "",
    alamat: "",
    status: "",
    kelas: "",
    image: "/noavatar.png",
    imagePublicId: "",
    userId: "", // Tambahkan field userId
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const response = await fetch(`/api/siswa/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setFormData({
            ...data.data,
            image: data.data.image || "/noavatar.png",
            imagePublicId: data.data.imagePublicId || "",
            userId: data.data.userId, // Pastikan userId tersimpan
          });
        } else {
          throw new Error(data.error || "Failed to fetch student data");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal mengambil data siswa",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSiswa();
  }, [params.id]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "nisn") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Ukuran file maksimal 2MB",
      });
      return;
    }

    setIsImageUploading(true);

    try {
      if (
        formData.imagePublicId &&
        formData.imagePublicId !== "tesa_skripsi/defaults/no-avatar"
      ) {
        await fetch("/api/upload/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: formData.imagePublicId }),
        });
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("entityType", "users");
      uploadFormData.append("entityId", params.id);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        const siswaResponse = await fetch(`/api/siswa/${params.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            image: data.fileName,
            imagePublicId: data.publicId,
          }),
        });

        const siswaData = await siswaResponse.json();

        if (siswaData.success) {
          setFormData((prev) => ({
            ...prev,
            image: data.fileName,
            imagePublicId: data.publicId,
          }));

          if (formData.userId) {
            await fetch(`/api/user/${formData.userId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image: data.fileName,
                imagePublicId: data.publicId,
              }),
            });
          }

          MySwal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Foto profil berhasil diperbarui",
            timer: 1500,
          });
        }
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
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama harus diisi";
    if (!formData.nisn) {
      newErrors.nisn = "NISN harus diisi";
    } else if (formData.nisn.length !== 10) {
      newErrors.nisn = "NISN harus 10 digit";
    }
    if (!formData.alamat.trim()) newErrors.alamat = "Alamat harus diisi";
    if (!formData.status) newErrors.status = "Status harus dipilih";
    if (!formData.kelas) newErrors.kelas = "Kelas harus dipilih";

    return newErrors;
  }, [formData]);

  const validatePassword = () => {
    const errors = {};
    if (passwordData.password) {
      if (passwordData.password.length < 6) {
        errors.password = "Password minimal 6 karakter";
      }
      if (passwordData.password !== passwordData.confirmPassword) {
        errors.confirmPassword = "Password tidak cocok";
      }
    }
    return errors;
  };

  const handleUpdatePassword = async () => {
    const validationErrors = validatePassword();
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }
  
    try {
      const result = await MySwal.fire({
        title: "Konfirmasi Update Password",
        text: "Apakah Anda yakin ingin mengubah password?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Ubah",
        cancelButtonText: "Batal",
      });
  
      if (!result.isConfirmed) return;
  
      setIsSubmitting(true);
  
      // Ambil userId string dari objek user
      const userId = formData.userId._id || formData.userId;
  
      const response = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.nama,
          email: `siswa${formData.nisn}@smpadventtompaso.com`,
          phone: "000000000000",
          pengguna: "user",
          image: formData.image,
          imagePublicId: formData.imagePublicId,
          password: passwordData.password
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        MySwal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Password berhasil diperbarui",
          timer: 1500,
        });
        
        setPasswordData({ password: "", confirmPassword: "" });
        setShowPasswordSection(false);
      } else {
        throw new Error(data.error || "Gagal memperbarui password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      MySwal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      text: "Data siswa akan diperbarui",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, perbarui",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);

      try {
        const siswaResponse = await fetch(`/api/siswa/${params.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const siswaData = await siswaResponse.json();

        if (siswaData.success) {
          if (formData.userId) {
            await fetch(`/api/user/${formData.userId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nama: formData.nama,
                image: formData.image,
                imagePublicId: formData.imagePublicId,
              }),
            });
          }

          await MySwal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data siswa berhasil diperbarui",
            timer: 2000,
          });

          router.push("/dashboard/siswa");
          router.refresh();
        } else {
          throw new Error(siswaData.error || "Gagal memperbarui data siswa");
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

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image
            src={formData.image}
            width={200}
            height={200}
            alt="Foto Siswa"
            className={styles.avatar}
            priority
            onClick={() =>
              !isImageUploading && document.getElementById("file-input").click()
            }
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
            : "Klik gambar untuk mengubah foto"}
        </p>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Nama Lengkap</label>
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
            <label>NISN</label>
            <input
              type="text"
              name="nisn"
              value={formData.nisn}
              onChange={handleChange}
              className={errors.nisn ? styles.inputError : styles.input}
              maxLength={10}
              disabled={isSubmitting}
            />
            {errors.nisn && <span className={styles.error}>{errors.nisn}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label>Alamat</label>
            <input
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              className={errors.alamat ? styles.inputError : styles.input}
              disabled={isSubmitting}
            />
            {errors.alamat && (
              <span className={styles.error}>{errors.alamat}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label>Status</label>
            <select
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
            <label>Kelas</label>
            <select
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

          {/* Password Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <KeyRound size={20} />
              {showPasswordSection ? "Batal Ubah Password" : "Ubah Password"}
            </button>

            {showPasswordSection && (
              <div className="mt-4 space-y-4">
                <div className={styles.inputGroup}>
                  <label>Password Baru</label>
                  <input
                    type="password"
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    className={
                      passwordErrors.password ? styles.inputError : styles.input
                    }
                    placeholder="Minimal 6 karakter"
                    disabled={isSubmitting}
                  />
                  {passwordErrors.password && (
                    <span className={styles.error}>
                      {passwordErrors.password}
                    </span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label>Konfirmasi Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={
                      passwordErrors.confirmPassword
                        ? styles.inputError
                        : styles.input
                    }
                    placeholder="Masukkan ulang password"
                    disabled={isSubmitting}
                  />
                  {passwordErrors.confirmPassword && (
                    <span className={styles.error}>
                      {passwordErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  onClick={handleUpdatePassword}
                  disabled={isSubmitting}
                >
                  <KeyRound size={20} />
                  {isSubmitting ? "Memperbarui Password..." : "Update Password"}
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
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

export default EditSiswaPage;
