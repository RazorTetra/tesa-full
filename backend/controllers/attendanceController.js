// backend/controllers/attendanceController.js
const Attendance = require("../models/attendance");
const Siswa = require("../models/siswa");

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('siswaId', 'nama nisn kelas');
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAttendanceBySemester = async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.query;
    
    const attendance = await Attendance.find({
      semester: parseInt(semester),
      tahunAjaran
    }).populate('siswaId', 'nama nisn kelas');

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAttendanceByClass = async (req, res) => {
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

exports.getStudentAttendance = async (req, res) => {
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

exports.createOrUpdateAttendance = async (req, res) => {
  try {
    const { 
      siswaId, 
      semester, 
      tahunAjaran,
      totalHadir,
      totalSakit,
      totalIzin,
      totalAlpa,
      totalHariEfektif
    } = req.body;

    // Validasi input
    if (!siswaId || !semester || !tahunAjaran || !totalHariEfektif) {
      return res.status(400).json({
        success: false,
        error: "Mohon lengkapi semua field yang dibutuhkan"
      });
    }

    // Cek apakah siswa ada
    const siswa = await Siswa.findById(siswaId);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        error: "Siswa tidak ditemukan"
      });
    }

    // Cari attendance yang sudah ada atau buat baru
    const attendance = await Attendance.findOneAndUpdate(
      { 
        siswaId,
        semester,
        tahunAjaran
      },
      {
        totalHadir: totalHadir || 0,
        totalSakit: totalSakit || 0,
        totalIzin: totalIzin || 0,
        totalAlpa: totalAlpa || 0,
        totalHariEfektif
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

exports.deleteAttendance = async (req, res) => {
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