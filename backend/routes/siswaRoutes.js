const express = require("express");
const router = express.Router();
const {
  getAllSiswa,
  createSiswa,
  getSiswa,
  updateSiswa,
  deleteSiswa,
} = require("../controllers/siswaController");

router.route("/").get(getAllSiswa).post(createSiswa);
router.route("/:id").get(getSiswa).put(updateSiswa).delete(deleteSiswa);

module.exports = router;
