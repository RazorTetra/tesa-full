// backend/models/siswa.js
import mongoose from 'mongoose';

const SiswaSchema = new mongoose.Schema({
  nama: { 
    type: String, 
    required: [true, 'Nama harus diisi'] 
  },
  nisn: { 
    type: String, 
    required: [true, 'NISN harus diisi'],
    unique: true
  },
  kelas: { 
    type: String, 
    required: [true, 'Kelas harus diisi'] 
  },
  alamat: { 
    type: String, 
    required: [true, 'Alamat harus diisi'] 
  },
  status: { 
    type: String, 
    required: [true, 'Status harus diisi'] 
  },
  image: { 
    type: String, 
    default: "/noavatar.png" 
  },
  imagePublicId: { 
    type: String, 
    default: "tesa_skripsi/defaults/no-avatar" 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Ubah ke false untuk seeding
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indeks untuk optimasi query
SiswaSchema.index({ nisn: 1 }, { unique: true });
SiswaSchema.index({ userId: 1 }, { unique: true });

// Middleware pre-save untuk validasi
SiswaSchema.pre('save', async function(next) {
  if (this.isNew && this.userId) { // Tambahkan check userId
    const siswa = this;
    try {
      // Cek duplikasi NISN
      const existingSiswa = await this.constructor.findOne({ nisn: siswa.nisn });
      if (existingSiswa) {
        throw new Error('NISN sudah terdaftar');
      }
      
      // Cek keberadaan user hanya jika userId ada
      if (siswa.userId) {
        const User = mongoose.model('User');
        const user = await User.findById(siswa.userId);
        if (!user) {
          throw new Error('User tidak ditemukan');
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Siswa = mongoose.models.Siswa || mongoose.model('Siswa', SiswaSchema);

// Export fungsi untuk seeder
export const deleteMany = () => Siswa.deleteMany();
export const insertMany = (data) => Siswa.insertMany(data);

export default Siswa;