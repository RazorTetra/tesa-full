const Guru = require("../models/guru");

exports.getAllGuru = async (req, res) => {
  try {
    const guru = await Guru.find();
    res.status(200).json({ success: true, data: guru });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createGuru = async (req, res) => {
  try {
    const guru = await Guru.create(req.body);
    res.status(201).json({ success: true, data: guru });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getGuru = async (req, res) => {
  try {
    const guru = await Guru.findById(req.params.id);
    if (!guru) {
      return res
        .status(404)
        .json({ success: false, error: "Guru tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: guru });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateGuru = async (req, res) => {
  try {
    const guru = await Guru.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!guru) {
      return res
        .status(404)
        .json({ success: false, error: "Guru tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: guru });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteGuru = async (req, res) => {
  try {
    const guru = await Guru.findByIdAndDelete(req.params.id);
    if (!guru) {
      return res
        .status(404)
        .json({ success: false, error: "Guru tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
