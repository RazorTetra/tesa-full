const express = require("express");
const router = express.Router();
const {
  getAllGuru,
  createGuru,
  getGuru,
  updateGuru,
  deleteGuru,
} = require("../controllers/guruController");

router.route("/").get(getAllGuru).post(createGuru);
router.route("/:id").get(getGuru).put(updateGuru).delete(deleteGuru);

module.exports = router;
