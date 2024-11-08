// backend/controllers/absenController.js
const Absen = require('../models/absen');

exports.getAllAbsensi = async (req, res) => {
  try {
    const absensi = await Absen.find().sort({ tanggal: -1 });
    res.status(200).json({ success: true, data: absensi });
  } catch (error) {
    console.error('Error fetching absensi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAbsensi = async (req, res) => {
  try {
    const { nama, tanggal, kelas, keterangan, mataPelajaran } = req.body;
    
    if (!nama || !tanggal || !kelas || !keterangan || !mataPelajaran) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Pastikan format tanggal konsisten
    const formattedDate = new Date(tanggal);
    formattedDate.setHours(0, 0, 0, 0);

    const newAbsen = new Absen({
      nama,
      tanggal: formattedDate,
      kelas,
      keterangan,
      mataPelajaran: mataPelajaran.trim().toUpperCase(),
    });

    await newAbsen.save();
    res.status(201).json({ success: true, data: newAbsen });
  } catch (error) {
    console.error('Error saving absen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Tambahkan endpoint untuk mendapatkan absensi hari ini
exports.getTodayAbsensi = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const absensi = await Absen.find({
      tanggal: {
        $gte: today,
        $lt: tomorrow
      }
    });

    res.status(200).json({ success: true, data: absensi });
  } catch (error) {
    console.error('Error fetching today absensi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};