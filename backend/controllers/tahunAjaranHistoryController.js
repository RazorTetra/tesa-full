// backend/controllers/tahunAjaranHistoryController.js
import TahunAjaranHistory from '../models/tahunAjaranHistory.js';

export const getAllHistory = async (req, res) => {
  try {
    const history = await TahunAjaranHistory.find()
      .populate('attendances.siswaId', 'nama nisn kelas')
      .sort({ tahunAjaran: -1, semester: -1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await TahunAjaranHistory.findById(id)
      .populate('attendances.siswaId', 'nama nisn kelas');

    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getHistoryByTahunAjaran = async (req, res) => {
  try {
    const { tahunAjaran, semester } = req.query;
    const query = {};
    
    if (tahunAjaran) query.tahunAjaran = tahunAjaran;
    if (semester) query.semester = semester;

    const history = await TahunAjaranHistory.find(query)
      .populate('attendances.siswaId', 'nama nisn kelas')
      .sort({ archivedAt: -1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getHistoryBySiswa = async (req, res) => {
  try {
    const { siswaId } = req.params;
    const histories = await TahunAjaranHistory.find({
      'attendances.siswaId': siswaId
    }).populate('attendances.siswaId', 'nama nisn kelas');

    const siswaHistories = histories.map(history => ({
      tahunAjaran: history.tahunAjaran,
      semester: history.semester,
      attendance: history.attendances.find(att => 
        att.siswaId._id.toString() === siswaId
      )
    }));

    res.status(200).json({
      success: true,
      data: siswaHistories
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};