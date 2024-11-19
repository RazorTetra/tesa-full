// backend/controllers/attendanceController.js
import Attendance from '../models/attendance.js';
import TahunAjaran from '../models/tahunAjaran.js';
import Siswa from '../models/siswa.js';

export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('siswaId', 'nama nisn kelas');
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAttendanceBySemester = async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    // Validasi tahun ajaran aktif
    const activeTahunAjaran = await TahunAjaran.findOne({
      tahunAjaran,
      semester: parseInt(semester),
      isActive: true
    });

    if (!activeTahunAjaran) {
      return res.status(404).json({
        success: false,
        error: "Tahun ajaran tidak aktif atau tidak ditemukan"
      });
    }

    const attendance = await Attendance.find({
      semester: parseInt(semester),
      tahunAjaran
    }).populate('siswaId', 'nama nisn kelas');

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAttendanceByClass = async (req, res) => {
  try {
    const { kelas, semester, tahunAjaran } = req.query;
    
    // Dapatkan semua siswa di kelas tersebut
    const siswa = await Siswa.find({ kelas });
    const siswaIds = siswa.map(s => s._id);

    const attendance = await Attendance.find({
      siswaId: { $in: siswaIds },
      semester: parseInt(semester),
      tahunAjaran
    }).populate('siswaId', 'nama nisn kelas');

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, tahunAjaran } = req.query;

    const attendance = await Attendance.findOne({
      siswaId: id,
      semester: parseInt(semester),
      tahunAjaran
    }).populate('siswaId', 'nama nisn kelas');

    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        error: "Data kehadiran tidak ditemukan" 
      });
    }

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const createOrUpdateAttendance = async (req, res) => {
  try {
    const { 
      siswaId, 
      semester, 
      tahunAjaran,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa
    } = req.body;

    // Validasi input
    if (!siswaId || !semester || !tahunAjaran) {
      return res.status(400).json({
        success: false,
        error: "Mohon lengkapi semua field yang dibutuhkan"
      });
    }

    // Cek tahun ajaran aktif
    const activeTahunAjaran = await TahunAjaran.findOne({
      tahunAjaran,
      semester: parseInt(semester),
      isActive: true
    });

    if (!activeTahunAjaran) {
      return res.status(400).json({
        success: false,
        error: "Tahun ajaran tidak aktif"
      });
    }

    // Cek siswa
    const siswa = await Siswa.findById(siswaId);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        error: "Siswa tidak ditemukan"
      });
    }

    // Cari atau buat attendance
    const attendance = await Attendance.findOneAndUpdate(
      { 
        siswaId,
        semester: parseInt(semester),
        tahunAjaran
      },
      {
        totalHadir: totalHadir || 0,
        totalSakit: totalSakit || 0,
        totalIzin: totalIzin || 0,
        totalAlpa: totalAlpa || 0
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const syncAttendance = async (req, res) => {
  try {
    const { tahunAjaranId } = req.body;

    if (!tahunAjaranId) {
      return res.status(400).json({
        success: false,
        error: "ID tahun ajaran diperlukan"
      });
    }

    await Attendance.syncWithSiswa(tahunAjaranId);

    res.status(200).json({
      success: true,
      message: "Sinkronisasi attendance berhasil"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: "Data kehadiran tidak ditemukan"
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Data kehadiran berhasil dihapus" 
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};