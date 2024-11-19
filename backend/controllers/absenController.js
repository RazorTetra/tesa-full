// backend/controllers/absenController.js
const Absen = require("../models/absen");
const Siswa = require("../models/siswa");
const Attendance = require("../models/attendance");
const TahunAjaran = require("../models/tahunAjaran");

const updateAttendance = async (siswaId, semester, tahunAjaran) => {
  try {
    // Get all absences for this student
    const absences = await Absen.find({
      siswaId,
      semester,
      tahunAjaran
    });

    // Get TahunAjaran data for totalHariEfektif
    const tahunAjaranData = await TahunAjaran.findOne({
      tahunAjaran,
      semester,
      isActive: true
    });

    if (!tahunAjaranData) {
      throw new Error("Tahun ajaran tidak aktif atau tidak ditemukan");
    }

    // Calculate totals
    const totals = {
      totalHadir: absences.filter(a => a.keterangan === 'HADIR').length,
      totalSakit: absences.filter(a => a.keterangan === 'SAKIT').length,
      totalIzin: absences.filter(a => a.keterangan === 'IZIN').length,
      totalAlpa: absences.filter(a => a.keterangan === 'ALPA').length
    };

    // Calculate percentage
    const persentaseKehadiran = 
      (totals.totalHadir / tahunAjaranData.totalHariEfektif) * 100;

    // Update attendance record
    await Attendance.findOneAndUpdate(
      {
        siswaId,
        semester,
        tahunAjaran
      },
      {
        ...totals,
        persentaseKehadiran: Math.round(persentaseKehadiran * 100) / 100
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    return true;
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

exports.getAllAbsensi = async (req, res) => {
  try {
    const absensi = await Absen.find()
      .populate("siswaId", "nama nisn kelas")
      .sort({ tanggal: -1 });
    res.status(200).json({ success: true, data: absensi });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAbsensi = async (req, res) => {
  try {
    const {
      siswaId,
      tanggal,
      kelas,
      keterangan,
      mataPelajaran,
      semester,
      tahunAjaran,
    } = req.body;

    // Validasi input
    if (!siswaId || !tanggal || !kelas || !keterangan || !mataPelajaran || !semester || !tahunAjaran) {
      return res.status(400).json({ 
        success: false, 
        error: "Semua field harus diisi" 
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

    // Format tanggal
    const formattedDate = new Date(tanggal);
    formattedDate.setHours(0, 0, 0, 0);

    // Cek duplikasi
    const existingAbsen = await Absen.findOne({
      siswaId,
      tanggal: formattedDate,
      mataPelajaran: mataPelajaran.toUpperCase()
    });

    if (existingAbsen) {
      return res.status(400).json({
        success: false,
        error: "Absensi untuk mata pelajaran ini di tanggal tersebut sudah ada"
      });
    }

    // Create new absen
    const newAbsen = await Absen.create({
      siswaId,
      tanggal: formattedDate,
      kelas,
      keterangan: keterangan.toUpperCase(),
      mataPelajaran: mataPelajaran.toUpperCase(),
      semester,
      tahunAjaran,
    });

    // Update attendance
    await updateAttendance(siswaId, semester, tahunAjaran);

    // Populate and return response
    const populatedAbsen = await Absen.findById(newAbsen._id)
      .populate("siswaId", "nama nisn kelas");

    res.status(201).json({ success: true, data: populatedAbsen });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Absensi duplikat terdeteksi"
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// absen berdasarkan kelas
exports.getAbsensiByKelas = async (req, res) => {
  try {
    const { kelas, tanggal } = req.query;
    const queryDate = new Date(tanggal);
    queryDate.setHours(0, 0, 0, 0);

    const absensi = await Absen.find({
      kelas,
      tanggal: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate("siswaId", "nama nisn");

    res.status(200).json({ success: true, data: absensi });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// absen hari ini
exports.getTodayAbsensi = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const absensi = await Absen.find({
      tanggal: {
        $gte: today,
        $lt: tomorrow,
      },
    }).populate("siswaId", "nama nisn kelas");

    res.status(200).json({ success: true, data: absensi });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update absensi (jika diperlukan)
exports.updateAbsensi = async (req, res) => {
  try {
    const { id } = req.params;
    const absen = await Absen.findById(id);
    
    if (!absen) {
      return res.status(404).json({
        success: false,
        error: "Absensi tidak ditemukan"
      });
    }

    const updatedAbsen = await Absen.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate("siswaId", "nama nisn kelas");

    // Update attendance after modifying absen
    await updateAttendance(
      updatedAbsen.siswaId,
      updatedAbsen.semester,
      updatedAbsen.tahunAjaran
    );

    res.status(200).json({ success: true, data: updatedAbsen });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete absensi (jika diperlukan)
exports.deleteAbsensi = async (req, res) => {
  try {
    const { id } = req.params;
    const absen = await Absen.findById(id);
    
    if (!absen) {
      return res.status(404).json({
        success: false,
        error: "Absensi tidak ditemukan"
      });
    }

    // Store siswa info before deletion
    const { siswaId, semester, tahunAjaran } = absen;

    await Absen.findByIdAndDelete(id);

    // Update attendance after deletion
    await updateAttendance(siswaId, semester, tahunAjaran);

    res.status(200).json({ 
      success: true, 
      message: "Absensi berhasil dihapus" 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};