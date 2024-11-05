// backend/models/attendance.js
const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    siswaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Siswa",
      required: true,
    },
    semester: {
      type: Number, // 1 atau 2
      required: true,
    },
    tahunAjaran: {
      type: String, // format: "2023/2024"
      required: true,
    },
    totalHadir: {
      type: Number,
      default: 0,
    },
    totalSakit: {
      type: Number,
      default: 0,
    },
    totalIzin: {
      type: Number,
      default: 0,
    },
    totalAlpa: {
      type: Number,
      default: 0,
    },
    totalHariEfektif: {
      type: Number,
      required: true,
    },
    persentaseKehadiran: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

// Middleware untuk menghitung persentase kehadiran sebelum save
AttendanceSchema.pre('save', function(next) {
  const totalHadir = this.totalHadir || 0;
  const totalHariEfektif = this.totalHariEfektif || 1; // Hindari pembagian dengan 0
  
  this.persentaseKehadiran = (totalHadir / totalHariEfektif) * 100;
  next();
});

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

module.exports = Attendance;