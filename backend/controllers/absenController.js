// backend/controllers/absenController.js
const Absen = require("../models/absen");
const Siswa = require("../models/siswa");

exports.getAllAbsensi = async (req, res) => {
  try {
    const absensi = await Absen.find()
      .populate("siswaId", "nama nisn kelas")
      .sort({ tanggal: -1 });
    res.status(200).json({ success: true, data: absensi });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAbsensi = async (req, res) => {
  try {
    const {
      siswaId,
      tanggal,
      kelas,
      keterangan,
      mataPelajaran,
      semester,
      tahunAjaran,
    } = req.body;

    // Validasi input
    if (
      !siswaId ||
      !tanggal ||
      !kelas ||
      !keterangan ||
      !mataPelajaran ||
      !semester ||
      !tahunAjaran
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Semua field harus diisi" });
    }

    // Cek siswa kalo ada
    const siswa = await Siswa.findById(siswaId);
    if (!siswa) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }

    // Format tanggal
    const formattedDate = new Date(tanggal);
    formattedDate.setHours(0, 0, 0, 0);

    const newAbsen = new Absen({
      siswaId,
      tanggal: formattedDate,
      kelas,
      keterangan: keterangan.toUpperCase(),
      mataPelajaran: mataPelajaran.toUpperCase(),
      semester,
      tahunAjaran,
    });

    await newAbsen.save();
    res.status(201).json({ success: true, data: newAbsen });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Absensi untuk siswa ini di tanggal tersebut sudah ada",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// absen berdasarkan kelas
exports.getAbsensiByKelas = async (req, res) => {
  try {
    const { kelas, tanggal } = req.query;
    const queryDate = new Date(tanggal);
    queryDate.setHours(0, 0, 0, 0);

    const absensi = await Absen.find({
      kelas,
      tanggal: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate("siswaId", "nama nisn");

    res.status(200).json({ success: true, data: absensi });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// absen hari ini
exports.getTodayAbsensi = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const absensi = await Absen.find({
      tanggal: {
        $gte: today,
        $lt: tomorrow,
      },
    }).populate("siswaId", "nama nisn kelas");

    res.status(200).json({ success: true, data: absensi });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
