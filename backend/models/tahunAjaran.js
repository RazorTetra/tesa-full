// backend/models/tahunAjaran.js
const mongoose = require("mongoose");

const TahunAjaranSchema = new mongoose.Schema({
  tahunAjaran: {
    type: String, // format: "2023/2024"
    required: true,
    unique: true
  },
  semester: {
    type: Number, // 1 atau 2
    required: true,
    enum: [1, 2]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tanggalMulai: {
    type: Date,
    required: true
  },
  tanggalSelesai: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Hanya boleh ada satu tahun ajaran yang aktif
TahunAjaranSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

const TahunAjaran = mongoose.models.TahunAjaran || mongoose.model('TahunAjaran', TahunAjaranSchema);

module.exports = TahunAjaran;