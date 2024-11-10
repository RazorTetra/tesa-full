// backend/routes/absenRoutes.js
const express = require('express');
const router = express.Router();
const absenController = require('../controllers/absenController');

// Get all absensi
router.get('/', absenController.getAllAbsensi);

// Create new absensi
router.post('/', absenController.createAbsensi);

// Get absensi by kelas
router.get('/kelas', absenController.getAbsensiByKelas);

// Get today's absensi
router.get('/today', absenController.getTodayAbsensi);

module.exports = router;