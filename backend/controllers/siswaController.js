const Siswa = require("../models/siswa");

exports.getAllSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.find();
    res.status(200).json({ success: true, data: siswa });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.create(req.body);
    res.status(201).json({ success: true, data: siswa });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findById(req.params.id);
    if (!siswa) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: siswa });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!siswa) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: siswa });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findByIdAndDelete(req.params.id);
    if (!siswa) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
