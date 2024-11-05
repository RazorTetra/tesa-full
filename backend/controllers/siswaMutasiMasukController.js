const SiswaMutasiMasuk = require("../models/siswaMutasiMasuk");

exports.getAllSiswaMutasiMasuk = async (req, res) => {
  try {
    const mutasiMasuk = await SiswaMutasiMasuk.find();
    res.status(200).json({ success: true, data: mutasiMasuk });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createSiswaMutasiMasuk = async (req, res) => {
  try {
    const {
      nama,
      nisn,
      kelas,
      alamat,
      tanggalMasuk,
      nomorSurat,
      asalSekolah,
      alasan,
    } = req.body;

    if (
      !nama ||
      !nisn ||
      !kelas ||
      !alamat ||
      !tanggalMasuk ||
      !nomorSurat ||
      !asalSekolah ||
      !alasan
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const mutasiMasuk = await SiswaMutasiMasuk.create(req.body);
    res.status(201).json({ success: true, data: mutasiMasuk });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getSiswaMutasiMasuk = async (req, res) => {
  try {
    const mutasiMasuk = await SiswaMutasiMasuk.findById(req.params.id);
    if (!mutasiMasuk) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: mutasiMasuk });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateSiswaMutasiMasuk = async (req, res) => {
  try {
    const mutasiMasuk = await SiswaMutasiMasuk.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!mutasiMasuk) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: mutasiMasuk });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteSiswaMutasiMasuk = async (req, res) => {
  try {
    const mutasiMasuk = await SiswaMutasiMasuk.findByIdAndDelete(req.params.id);
    if (!mutasiMasuk) {
      return res
        .status(404)
        .json({ success: false, error: "Siswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, message: "Siswa berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
