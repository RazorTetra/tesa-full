const express = require("express");
const router = express.Router();
const {
  getAllSiswaMutasiKeluar,
  createSiswaMutasiKeluar,
  getSiswaMutasiKeluar,
  updateSiswaMutasiKeluar,
  deleteSiswaMutasiKeluar,
} = require("../controllers/siswaMutasiKeluarController");

router.route("/").get(getAllSiswaMutasiKeluar).post(createSiswaMutasiKeluar);
router
  .route("/:id")
  .get(getSiswaMutasiKeluar)
  .put(updateSiswaMutasiKeluar)
  .delete(deleteSiswaMutasiKeluar);

module.exports = router;
