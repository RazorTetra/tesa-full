const Absen = require('../models/absen');

exports.getAllAbsensi = async (req, res) => {
  try {
    const absensi = await Absen.find();
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

    const newAbsen = new Absen({
      nama,
      tanggal,
      kelas,
      keterangan,
      mataPelajaran,
    });

    await newAbsen.save();
    res.status(201).json({ success: true, data: newAbsen });
  } catch (error) {
    console.error('Error saving absen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
