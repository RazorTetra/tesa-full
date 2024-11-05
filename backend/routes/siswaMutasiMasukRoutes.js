const express = require("express");
const router = express.Router();
const {
  getAllSiswaMutasiMasuk,
  createSiswaMutasiMasuk,
  getSiswaMutasiMasuk,
  updateSiswaMutasiMasuk,
  deleteSiswaMutasiMasuk,
} = require("../controllers/siswaMutasiMasukController");

router.route("/").get(getAllSiswaMutasiMasuk).post(createSiswaMutasiMasuk);
router
  .route("/:id")
  .get(getSiswaMutasiMasuk)
  .put(updateSiswaMutasiMasuk)
  .delete(deleteSiswaMutasiMasuk);

module.exports = router;
