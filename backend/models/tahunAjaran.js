import mongoose from 'mongoose';

const TahunAjaranSchema = new mongoose.Schema(
  {
    tahunAjaran: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{4}\/\d{4}$/.test(v);
        },
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
  },
  { timestamps: true }
);

TahunAjaranSchema.pre("save", function (next) {
  if (this.tanggalMulai >= this.tanggalSelesai) {
    next(new Error("Tanggal mulai harus lebih awal dari tanggal selesai"));
  }
  next();
});

TahunAjaranSchema.pre("save", async function (next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const TahunAjaran = mongoose.models.TahunAjaran || 
  mongoose.model("TahunAjaran", TahunAjaranSchema);
export const deleteMany = () => TahunAjaran.deleteMany();
export const insertMany = (data) => TahunAjaran.insertMany(data);
export default TahunAjaran;