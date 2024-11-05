const mongoose = require("mongoose");

const SiswaMutasiKeluarSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    nisn: { type: String, required: true },
    kelas: { type: String, required: true },
    alamat: { type: String, required: true },
    tanggalKeluar: { type: Date, required: true },
    nomorSurat: { type: String, required: true },
    tujuanSekolah: { type: String, required: true },
    alasan: { type: String, required: true },
    image: { type: String, default: "/noavatar.png" },
  },
  { timestamps: true },
);

const SiswaMutasiKeluar =
  mongoose.models.SiswaMutasiKeluar ||
  mongoose.model("SiswaMutasiKeluar", SiswaMutasiKeluarSchema);

module.exports = SiswaMutasiKeluar;
