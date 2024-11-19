// backend/models/absen.js
import mongoose from 'mongoose';
import Attendance from './attendance.js';

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
  },
  counted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
AbsenSchema.index({ siswaId: 1, tanggal: 1, mataPelajaran: 1 }, { unique: true });
AbsenSchema.index({ tahunAjaran: 1, semester: 1 });
AbsenSchema.index({ counted: 1 });

// Validasi tahun ajaran aktif
AbsenSchema.pre('save', async function(next) {
  if (this.isNew) {
    const TahunAjaran = mongoose.model('TahunAjaran');
    const activeTahunAjaran = await TahunAjaran.findOne({
      tahunAjaran: this.tahunAjaran,
      semester: this.semester,
      isActive: true
    });

    if (!activeTahunAjaran) {
      throw new Error('Hanya bisa absen pada tahun ajaran yang aktif');
    }
  }
  next();
});

// Post save hook untuk update attendance
AbsenSchema.post('save', async function(doc) {
  try {
    // Get all absences for this student in current semester and tahun ajaran
    const absences = await this.constructor.find({
      siswaId: doc.siswaId,
      semester: doc.semester,
      tahunAjaran: doc.tahunAjaran
    });

    // Calculate totals
    const totals = absences.reduce((acc, curr) => {
      acc[curr.keterangan.toLowerCase()] = (acc[curr.keterangan.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    // Get TahunAjaran for total hari efektif
    const TahunAjaran = mongoose.model('TahunAjaran');
    const tahunAjaranData = await TahunAjaran.findOne({
      tahunAjaran: doc.tahunAjaran,
      semester: doc.semester
    });

    if (!tahunAjaranData) {
      throw new Error('Tahun ajaran tidak ditemukan');
    }

    // Calculate percentage
    const totalHadir = totals.hadir || 0;
    const persentaseKehadiran = (totalHadir / tahunAjaranData.totalHariEfektif) * 100;

    // Update or create attendance record
    await Attendance.findOneAndUpdate(
      {
        siswaId: doc.siswaId,
        semester: doc.semester,
        tahunAjaran: doc.tahunAjaran
      },
      {
        totalHadir: totals.hadir || 0,
        totalSakit: totals.sakit || 0,
        totalIzin: totals.izin || 0,
        totalAlpa: totals.alpa || 0,
        persentaseKehadiran: Math.round(persentaseKehadiran * 100) / 100
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

  } catch (error) {
    console.error('Error updating attendance:', error);
    // Don't throw error here to prevent absen save from failing
  }
});

// Handle deletions too
AbsenSchema.post('remove', async function(doc) {
  try {
    await updateAttendance(doc.siswaId, doc.semester, doc.tahunAjaran);
  } catch (error) {
    console.error('Error updating attendance after deletion:', error);
  }
});

const Absen = mongoose.models.Absen || mongoose.model('Absen', AbsenSchema);

export default Absen;
export const deleteMany = async () => await Absen.deleteMany({});
export const insertMany = async (data) => await Absen.insertMany(data);