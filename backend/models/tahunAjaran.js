// backend/models/tahunAjaran.js
import mongoose from 'mongoose';
import Attendance from './attendance.js';
import Absen from './absen.js';
import TahunAjaranHistory from './tahunAjaranHistory.js';

const TahunAjaranSchema = new mongoose.Schema({
  tahunAjaran: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^\d{4}\/\d{4}$/.test(v),
      message: (props) =>
        `${props.value} bukan format tahun ajaran yang valid! Gunakan format: 2023/2024`,
    },
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tanggalMulai: {
    type: Date,
    required: true,
  },
  tanggalSelesai: {
    type: Date,
    required: true,
  },
  totalHariEfektif: {
    type: Number,
    required: true,
    min: [1, "Total hari efektif minimal 1"],
  },
}, { 
  timestamps: true 
});

// Pre-save middleware untuk validasi tanggal
TahunAjaranSchema.pre('save', function(next) {
  if (this.tanggalMulai >= this.tanggalSelesai) {
    next(new Error("Tanggal mulai harus lebih awal dari tanggal selesai"));
  }
  next();
});

// Pre-save middleware untuk menangani status aktif
TahunAjaranSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

// Pre-remove middleware untuk cascade delete dan archiving
TahunAjaranSchema.pre('remove', async function(next) {
  try {
    // Prepare history data
    const historyData = {
      tahunAjaran: this.tahunAjaran,
      semester: this.semester,
      totalHariEfektif: this.totalHariEfektif,
      tanggalMulai: this.tanggalMulai,
      tanggalSelesai: this.tanggalSelesai,
      attendances: []
    };

    // Get all attendance records
    const attendances = await Attendance.find({
      tahunAjaran: this.tahunAjaran,
      semester: this.semester
    });

    // Collect all absen records for each attendance
    for (const attendance of attendances) {
      const absens = await Absen.find({
        siswaId: attendance.siswaId,
        tahunAjaran: this.tahunAjaran,
        semester: this.semester
      });

      historyData.attendances.push({
        siswaId: attendance.siswaId,
        totalHadir: attendance.totalHadir,
        totalSakit: attendance.totalSakit,
        totalIzin: attendance.totalIzin,
        totalAlpa: attendance.totalAlpa,
        persentaseKehadiran: attendance.persentaseKehadiran,
        absens: absens.map(a => ({
          tanggal: a.tanggal,
          keterangan: a.keterangan,
          mataPelajaran: a.mataPelajaran
        }))
      });
    }

    // Save to history
    await TahunAjaranHistory.create(historyData);

    // Delete related records
    await Attendance.deleteMany({
      tahunAjaran: this.tahunAjaran,
      semester: this.semester
    });
    
    await Absen.deleteMany({
      tahunAjaran: this.tahunAjaran,
      semester: this.semester
    });

    next();
  } catch (error) {
    next(error);
  }
});

const TahunAjaran = mongoose.models.TahunAjaran || mongoose.model('TahunAjaran', TahunAjaranSchema);

export const deleteMany = () => TahunAjaran.deleteMany();
export const insertMany = (data) => TahunAjaran.insertMany(data);
export default TahunAjaran;