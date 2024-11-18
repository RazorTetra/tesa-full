import mongoose from 'mongoose';

const GuruSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  nip: { type: String, required: true },
  nomorTlp: { type: String, required: true },
  agama: { type: String, required: true },
  alamat: { type: String, required: true },
  image: { type: String, default: "" },
});

const Guru = mongoose.models.Guru || mongoose.model("Guru", GuruSchema);

// Export model dan operasi yang dibutuhkan seeder
export const deleteMany = () => Guru.deleteMany();
export const insertMany = (data) => Guru.insertMany(data);
export default Guru;