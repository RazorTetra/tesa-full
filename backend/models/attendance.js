// backend/models/attendance.js
import mongoose from "mongoose";
import TahunAjaran from "./tahunAjaran.js";

const AttendanceSchema = new mongoose.Schema(
  {
    siswaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Siswa",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    tahunAjaran: {
      type: String,
      required: true,
    },
    totalHadir: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSakit: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalIzin: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAlpa: {
      type: Number,
      default: 0,
      min: 0,
    },
    persentaseKehadiran: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save untuk kalkulasi persentase
AttendanceSchema.pre("save", async function (next) {
  if (
    this.isModified("totalHadir") ||
    this.isModified("totalSakit") ||
    this.isModified("totalIzin") ||
    this.isModified("totalAlpa")
  ) {
    const tahunAjaran = await TahunAjaran.findOne({
      tahunAjaran: this.tahunAjaran,
      semester: this.semester,
    });

    if (!tahunAjaran) {
      throw new Error("Tahun ajaran tidak ditemukan");
    }

    this.persentaseKehadiran =
      (this.totalHadir / tahunAjaran.totalHariEfektif) * 100;
    // Round to 2 decimal places
    this.persentaseKehadiran = Math.round(this.persentaseKehadiran * 100) / 100;
  }
  next();
});

// Static method untuk sync dengan siswa baru
AttendanceSchema.statics.syncWithSiswa = async function (tahunAjaranId) {
  try {
    const tahunAjaran = await TahunAjaran.findById(tahunAjaranId);
    if (!tahunAjaran) throw new Error("Tahun ajaran tidak ditemukan");

    const siswaList = await mongoose.model("Siswa").find();

    const operations = siswaList.map(async (siswa) => {
      const existingAttendance = await this.findOne({
        siswaId: siswa._id,
        tahunAjaran: tahunAjaran.tahunAjaran,
        semester: tahunAjaran.semester,
      });

      if (!existingAttendance) {
        return this.create({
          siswaId: siswa._id,
          tahunAjaran: tahunAjaran.tahunAjaran,
          semester: tahunAjaran.semester,
          totalHadir: 0,
          totalSakit: 0,
          totalIzin: 0,
          totalAlpa: 0,
          persentaseKehadiran: 0,
        });
      }
    });

    await Promise.all(operations);
    return true;
  } catch (error) {
    console.error("Sync attendance error:", error);
    throw error;
  }
};

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

export default Attendance;
