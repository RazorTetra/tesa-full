import mongoose from 'mongoose';

const AbsenSchema = new mongoose.Schema({
  siswaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Siswa',
    required: [true, 'ID Siswa harus diisi']
  },
  tanggal: {
    type: Date,
    required: [true, 'Tanggal harus diisi']
  },
  kelas: {
    type: String,
    required: [true, 'Kelas harus diisi']
  },
  keterangan: {
    type: String,
    enum: ['HADIR', 'SAKIT', 'IZIN', 'ALPA'],
    required: [true, 'Keterangan harus diisi']
  },
  mataPelajaran: {
    type: String,
    required: [true, 'Mata pelajaran harus diisi'],
    uppercase: true
  },
  semester: {
    type: Number,
    required: [true, 'Semester harus diisi'],
    enum: [1, 2]
  },
  tahunAjaran: {
    type: String,
    required: [true, 'Tahun ajaran harus diisi']
  }
}, {
  timestamps: true
});

AbsenSchema.index({ siswaId: 1, tanggal: 1, mataPelajaran: 1 }, { unique: true });

const Absen = mongoose.models.Absen || mongoose.model('Absen', AbsenSchema);

export default Absen;
export const deleteMany = async () => await Absen.deleteMany({});
export const insertMany = async (data) => await Absen.insertMany(data);