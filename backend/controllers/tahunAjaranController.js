// backend/controllers/tahunAjaranController.js
const TahunAjaran = require("../models/tahunAjaran");

exports.getAllTahunAjaran = async (req, res) => {
  try {
    const tahunAjaran = await TahunAjaran.find().sort('-tanggalMulai');
    res.status(200).json({ success: true, data: tahunAjaran });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getActiveTahunAjaran = async (req, res) => {
  try {
    const activeTahunAjaran = await TahunAjaran.findOne({ isActive: true });
    if (!activeTahunAjaran) {
      return res.status(404).json({ 
        success: false, 
        error: "Tidak ada tahun ajaran yang aktif" 
      });
    }
    res.status(200).json({ success: true, data: activeTahunAjaran });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createTahunAjaran = async (req, res) => {
  try {
    const tahunAjaran = await TahunAjaran.create(req.body);
    res.status(201).json({ success: true, data: tahunAjaran });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateTahunAjaran = async (req, res) => {
  try {
    const tahunAjaran = await TahunAjaran.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tahunAjaran) {
      return res.status(404).json({ 
        success: false, 
        error: "Tahun ajaran tidak ditemukan" 
      });
    }
    res.status(200).json({ success: true, data: tahunAjaran });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};