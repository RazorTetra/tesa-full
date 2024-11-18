import mongoose from 'mongoose';

const SiswaMutasiMasukSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    nisn: { type: String, required: true },
    kelas: { type: String, required: true },
    alamat: { type: String, required: true },
    tanggalMasuk: { type: Date, required: true },
    nomorSurat: { type: String, required: true },
    asalSekolah: { type: String, required: true },
    alasan: { type: String, required: true },
    image: { type: String, default: "/noavatar.png" },
  },
  { timestamps: true },
);

const SiswaMutasiMasuk = mongoose.models.SiswaMutasiMasuk || 
  mongoose.model("SiswaMutasiMasuk", SiswaMutasiMasukSchema);
export const deleteMany = () => SiswaMutasiMasuk.deleteMany();
export const insertMany = (data) => SiswaMutasiMasuk.insertMany(data);
export default SiswaMutasiMasuk;