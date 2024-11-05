// backend/config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Pastikan nama database ada dalam URI setelah hostname dan sebelum parameter
    const MONGODB_URI = "mongodb+srv://admin:ZfwEeovOxuIIBzNT@cluster0.tlq0c.mongodb.net/tesa_skripsi?retryWrites=true&w=majority"
    ;
    
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Log nama database untuk memverifikasi koneksi
    console.log(`MongoDB Atlas connected successfully to database: ${connection.connection.db.databaseName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;