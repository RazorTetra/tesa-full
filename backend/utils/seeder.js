// backend/utils/seeder.js
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');

// Import all models
const User = require('../models/user');
const Guru = require('../models/guru');
const Siswa = require('../models/siswa');
const SiswaMutasiMasuk = require('../models/siswaMutasiMasuk');
const SiswaMutasiKeluar = require('../models/siswaMutasiKeluar');
const Absen = require('../models/absen');

const validateData = async (data, model) => {
  const errors = [];
  for (const item of data) {
    const doc = new model(item);
    try {
      await doc.validate();
    } catch (error) {
      errors.push(`Validation error for ${model.modelName}: ${error.message}`);
    }
  }
  if (errors.length > 0) {
    throw new Error(`Validation errors found:\n${errors.join('\n')}`);
  }
};

const generateSampleData = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  return {
    userData: [
      {
        nama: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '08123456789',
        pengguna: 'admin'
      },
      {
        nama: 'Regular User',
        username: 'user',
        email: 'user@example.com',
        password: hashedPassword,
        phone: '08987654321',
        pengguna: 'user'
      }
    ],
    guruData: [
      {
        nama: 'Budi Santoso, S.Pd',
        nip: '198501012010011001',
        nomorTlp: '081234567890',
        agama: 'Islam',
        alamat: 'Jl. Pendidikan No. 1'
      },
      {
        nama: 'Siti Rahayu, M.Pd',
        nip: '198703022011012002',
        nomorTlp: '081345678901',
        agama: 'Islam',
        alamat: 'Jl. Guru No. 2'
      }
    ],
    siswaData: [
      {
        nama: 'Ahmad Rizki',
        nisn: '0054367289',
        kelas: 'X-A',
        alamat: 'Jl. Pelajar No. 1',
        status: 'Aktif'
      },
      {
        nama: 'Putri Amelia',
        nisn: '0054367290',
        kelas: 'X-B',
        alamat: 'Jl. Siswa No. 2',
        status: 'Aktif'
      }
    ],
    siswaMutasiMasukData: [
      {
        nama: 'Deni Firmansyah',
        nisn: '0054367291',
        kelas: 'XI-A',
        alamat: 'Jl. Mutasi No. 1',
        tanggalMasuk: new Date('2024-01-15'),
        nomorSurat: 'MSK/2024/001',
        asalSekolah: 'SMA Negeri 2',
        alasan: 'Pindah domisili orangtua'
      }
    ],
    siswaMutasiKeluarData: [
      {
        nama: 'Rina Wati',
        nisn: '0054367292',
        kelas: 'XI-B',
        alamat: 'Jl. Keluar No. 1',
        tanggalKeluar: new Date('2024-02-01'),
        nomorSurat: 'KLR/2024/001',
        tujuanSekolah: 'SMA Negeri 3',
        alasan: 'Mengikuti orangtua pindah tugas'
      }
    ],
    absenData: [
      {
        nama: 'Ahmad Rizki',
        tanggal: new Date(),
        kelas: 'X-A',
        keterangan: 'Hadir',
        mataPelajaran: 'Matematika'
      },
      {
        nama: 'Putri Amelia',
        tanggal: new Date(),
        kelas: 'X-B',
        keterangan: 'Izin',
        mataPelajaran: 'Bahasa Indonesia'
      }
    ]
  };
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to database...');

    // Generate sample data with hashed passwords
    const sampleData = await generateSampleData();

    // Validate all data before clearing database
    await validateData(sampleData.userData, User);
    await validateData(sampleData.guruData, Guru);
    await validateData(sampleData.siswaData, Siswa);
    await validateData(sampleData.siswaMutasiMasukData, SiswaMutasiMasuk);
    await validateData(sampleData.siswaMutasiKeluarData, SiswaMutasiKeluar);
    await validateData(sampleData.absenData, Absen);

    console.log('All data validated successfully');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Guru.deleteMany(),
      Siswa.deleteMany(),
      SiswaMutasiMasuk.deleteMany(),
      SiswaMutasiKeluar.deleteMany(),
      Absen.deleteMany()
    ]);

    console.log('Existing data cleared');

    // Insert new data
    await Promise.all([
      User.insertMany(sampleData.userData),
      Guru.insertMany(sampleData.guruData),
      Siswa.insertMany(sampleData.siswaData),
      SiswaMutasiMasuk.insertMany(sampleData.siswaMutasiMasukData),
      SiswaMutasiKeluar.insertMany(sampleData.siswaMutasiKeluarData),
      Absen.insertMany(sampleData.absenData)
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`
    Seeded data summary:
    - Users: ${sampleData.userData.length}
    - Guru: ${sampleData.guruData.length}
    - Siswa: ${sampleData.siswaData.length}
    - Mutasi Masuk: ${sampleData.siswaMutasiMasukData.length}
    - Mutasi Keluar: ${sampleData.siswaMutasiKeluarData.length}
    - Absensi: ${sampleData.absenData.length}
    `);

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();