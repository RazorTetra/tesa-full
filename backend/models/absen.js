// backend/models/absen.js
const mongoose = require('mongoose');

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

AbsenSchema.post('save', async function(doc) {
  try {
    const TahunAjaran = mongoose.models.TahunAjaran || require('./tahunAjaran');
    const Attendance = mongoose.models.Attendance || require('./attendance');
    
    const tahunAjaranData = await TahunAjaran.findOne({
      tahunAjaran: doc.tahunAjaran,
      isActive: true
    });

    if (!tahunAjaranData || !tahunAjaranData.totalHariEfektif) {
      console.log('Tahun ajaran tidak valid');
      return;
    }

    const totalAbsensi = await mongoose.model('Absen').aggregate([
      {
        $match: {
          siswaId: doc.siswaId,
          semester: doc.semester,
          tahunAjaran: doc.tahunAjaran
        }
      },
      {
        $group: {
          _id: '$keterangan',
          count: { $sum: 1 }
        }
      }
    ]);

    let totalHadir = 0;
    let totalSakit = 0;
    let totalIzin = 0;
    let totalAlpa = 0;
    const totalHariEfektif = Math.max(1, tahunAjaranData.totalHariEfektif);

    totalAbsensi.forEach(item => {
      const count = Math.max(0, item.count || 0);
      switch(item._id) {
        case 'HADIR':
          totalHadir = count;
          break;
        case 'SAKIT':
          totalSakit = count;
          break;
        case 'IZIN':
          totalIzin = count;
          break;
        case 'ALPA':
          totalAlpa = count;
          break;
      }
    });

    // hitung persentase
    const persentaseKehadiran = totalHariEfektif > 0 
      ? Math.min(100, Math.max(0, (totalHadir / totalHariEfektif) * 100))
      : 0;

    const updateData = {
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa,
      totalHariEfektif,
      persentaseKehadiran: Math.round(persentaseKehadiran * 100) / 100
    };

    await Attendance.findOneAndUpdate(
      {
        siswaId: doc.siswaId,
        semester: doc.semester,
        tahunAjaran: doc.tahunAjaran
      },
      { $set: updateData },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

  } catch (error) {
    console.error('Error updating attendance:', error);
  }
});

module.exports = mongoose.models.Absen || mongoose.model('Absen', AbsenSchema);