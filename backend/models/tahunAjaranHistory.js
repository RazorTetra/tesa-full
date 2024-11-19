// backend/models/tahunAjaranHistory.js
import mongoose from 'mongoose';

const TahunAjaranHistorySchema = new mongoose.Schema({
  tahunAjaran: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  totalHariEfektif: {
    type: Number,
    required: true
  },
  tanggalMulai: {
    type: Date,
    required: true
  },
  tanggalSelesai: {
    type: Date,
    required: true
  },
  attendances: [{
    siswaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Siswa',
      required: true
    },
    totalHadir: {
      type: Number,
      default: 0
    },
    totalSakit: {
      type: Number,
      default: 0
    },
    totalIzin: {
      type: Number,
      default: 0
    },
    totalAlpa: {
      type: Number,
      default: 0
    },
    persentaseKehadiran: {
      type: Number,
      default: 0
    },
    absens: [{
      tanggal: Date,
      keterangan: {
        type: String,
        enum: ['HADIR', 'SAKIT', 'IZIN', 'ALPA']
      },
      mataPelajaran: String
    }]
  }],
  archivedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const TahunAjaranHistory = mongoose.models.TahunAjaranHistory || 
  mongoose.model('TahunAjaranHistory', TahunAjaranHistorySchema);

export default TahunAjaranHistory;