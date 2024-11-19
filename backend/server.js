const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const siswaRoutes = require("./routes/siswaRoutes");
const guruRoutes = require("./routes/guruRoutes");
const siswaMutasiMasukRoutes = require("./routes/siswaMutasiMasukRoutes");
const siswaMutasiKeluarRoutes = require("./routes/siswaMutasiKeluarRoutes");
const userRoutes = require("./routes/userRoutes");
const absenRoutes = require("./routes/absenRoutes");
const tahunAjaranHistoryRoutes = require("./routes/tahunAjaranHistoryRoutes.js");

dotenv.config();

const app = express();
connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.use("/api/siswa", siswaRoutes);
app.use("/api/guru", guruRoutes);
app.use("/api/user", userRoutes);
app.use("/api/siswaMutasiMasuk", siswaMutasiMasukRoutes);
app.use("/api/siswaMutasiKeluar", siswaMutasiKeluarRoutes);
app.use("/api/absen", absenRoutes);
app.use("/api/history", tahunAjaranHistoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
