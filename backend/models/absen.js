const mongoose = require('mongoose');

const AbsenSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },
  tanggal: {
    type: Date,
    required: true,
  },
  kelas: {
    type: String,
    required: true,
  },
  keterangan: {
    type: String,
    required: true,
  },
  mataPelajaran: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Absen || mongoose.model('Absen', AbsenSchema);
