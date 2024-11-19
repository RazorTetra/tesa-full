// backend/controllers/tahunAjaranController.js
import TahunAjaran from '../models/tahunAjaran.js';
import Attendance from '../models/attendance.js';

export const getAllTahunAjaran = async (req, res) => {
  try {
    const tahunAjaran = await TahunAjaran.find().sort('-tanggalMulai');
    res.status(200).json({ success: true, data: tahunAjaran });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getActiveTahunAjaran = async (req, res) => {
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

export const createTahunAjaran = async (req, res) => {
  try {
    // Set tahun ajaran lain menjadi tidak aktif jika yang baru aktif
    if (req.body.isActive) {
      await TahunAjaran.updateMany(
        { isActive: true },
        { isActive: false }
      );
    }

    const tahunAjaran = await TahunAjaran.create(req.body);

    // Sync attendance untuk siswa yang ada
    if (tahunAjaran.isActive) {
      await Attendance.syncWithSiswa(tahunAjaran._id);
    }

    res.status(201).json({ success: true, data: tahunAjaran });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateTahunAjaran = async (req, res) => {
  try {
    // Jika mengubah status aktif
    if (req.body.isActive) {
      await TahunAjaran.updateMany(
        { _id: { $ne: req.params.id }, isActive: true },
        { isActive: false }
      );
    }

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

    // Sync attendance jika mengaktifkan tahun ajaran
    if (req.body.isActive) {
      await Attendance.syncWithSiswa(tahunAjaran._id);
    }

    res.status(200).json({ success: true, data: tahunAjaran });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteTahunAjaran = async (req, res) => {
  try {
    const tahunAjaran = await TahunAjaran.findById(req.params.id);
    
    if (!tahunAjaran) {
      return res.status(404).json({
        success: false,
        error: "Tahun ajaran tidak ditemukan"
      });
    }

    if (tahunAjaran.isActive) {
      return res.status(400).json({
        success: false,
        error: "Tidak dapat menghapus tahun ajaran yang sedang aktif"
      });
    }

    // Pre-remove middleware akan menangani archiving dan cleanup
    await tahunAjaran.remove();

    res.status(200).json({
      success: true,
      message: "Tahun ajaran dan data terkait berhasil dihapus"
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const activateTahunAjaran = async (req, res) => {
  try {
    const { id } = req.params;

    // Nonaktifkan semua tahun ajaran
    await TahunAjaran.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Aktifkan tahun ajaran yang dipilih
    const tahunAjaran = await TahunAjaran.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    if (!tahunAjaran) {
      return res.status(404).json({
        success: false,
        error: "Tahun ajaran tidak ditemukan"
      });
    }

    // Sync attendance untuk tahun ajaran baru
    await Attendance.syncWithSiswa(tahunAjaran._id);

    res.status(200).json({
      success: true,
      data: tahunAjaran
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};