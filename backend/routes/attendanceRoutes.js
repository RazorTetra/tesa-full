// backend/routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllAttendance,
  getAttendanceBySemester,
  getAttendanceByClass,
  getStudentAttendance,
  createOrUpdateAttendance,
  deleteAttendance
} = require("../controllers/attendanceController");

// Get all attendance records
router.get("/", getAllAttendance);

// Get attendance by semester and tahun ajaran
router.get("/semester", getAttendanceBySemester);

// Get attendance by class
router.get("/kelas", getAttendanceByClass);

// Get specific student's attendance
router.get("/siswa/:id", getStudentAttendance);

// Create or update attendance
router.post("/", createOrUpdateAttendance);

// Delete attendance
router.delete("/:id", deleteAttendance);

module.exports = router;