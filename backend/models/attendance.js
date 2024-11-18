import mongoose from 'mongoose';

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
    totalHariEfektif: {
      type: Number,
      required: true,
      min: 1,
    },
    persentaseKehadiran: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      set: (v) => Math.round(v * 100) / 100,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
export const deleteMany = () => Attendance.deleteMany();
export const insertMany = (data) => Attendance.insertMany(data);
export default Attendance;