const express = require('express');
const router = express.Router();
const absenController = require('../controllers/absenController');

router.get('/', absenController.getAllAbsensi);
router.post('/', absenController.createAbsensi);

module.exports = router;
