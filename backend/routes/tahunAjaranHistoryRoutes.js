// backend/routes/tahunAjaranHistoryRoutes.js
import express from 'express';
import {
  getAllHistory,
  getHistoryById,
  getHistoryByTahunAjaran,
  getHistoryBySiswa
} from '../controllers/tahunAjaranHistoryController.js';

const router = express.Router();

router.get('/', getAllHistory);
router.get('/id/:id', getHistoryById);
router.get('/tahun-ajaran', getHistoryByTahunAjaran);
router.get('/siswa/:siswaId', getHistoryBySiswa);

export default router;