const SiswaMutasiKeluar = require("../models/siswaMutasiKeluar");

exports.getAllSiswaMutasiKeluar = async (req, res) => {
  try {
    const mutasiKeluar = await SiswaMutasiKeluar.find();
    res.status(200).json({ success: true, data: mutasiKeluar });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createSiswaMutasiKeluar = async (req, res) => {
  try {
    const {
      nama,
      nisn,
      kelas,
      alamat,
      tanggalKeluar,
      nomorSurat,
      tujuanSekolah,
      alasan,
    } = req.body;

    if (
      !nama ||
      !nisn ||
      !kelas ||
      !alamat ||
      !tanggalKeluar ||
      !nomorSurat ||
      !tujuanSekolah ||
      !alasan
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const mutasiKeluar = await SiswaMutasiKeluar.create(req.body);
    res.status(201).json({ success: true, data: mutasiKeluar });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSiswaMutasiKeluar = async (req, res) => {
  try {
    const mutasiKeluar = await SiswaMutasiKeluar.findById(req.params.id);
    if (!mutasiKeluar) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: mutasiKeluar });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateSiswaMutasiKeluar = async (req, res) => {
  try {
    const mutasiKeluar = await SiswaMutasiKeluar.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!mutasiKeluar) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: mutasiKeluar });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteSiswaMutasiKeluar = async (req, res) => {
  try {
    const mutasiKeluar = await SiswaMutasiKeluar.findByIdAndDelete(
      req.params.id,
    );
    if (!mutasiKeluar) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, message: "Siswa berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
