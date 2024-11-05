// backend/models/siswa.js
const mongoose = require("mongoose");

const SiswaSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    nisn: { type: String, required: true },
    kelas: { type: String, required: true },
    alamat: { type: String, required: true },
    status: { type: String, required: true },
    image: { type: String, default: "/noavatar.png" },
    imagePublicId: { type: String, default: "tesa_skripsi/defaults/no-avatar" }
  },
  { timestamps: true }
);

const Siswa = mongoose.models.Siswa || mongoose.model("Siswa", SiswaSchema);

module.exports = Siswa;