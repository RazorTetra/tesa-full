// backend/config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    const connection = await mongoose.connect(MONGODB_URI);
    
    console.log(`MongoDB Atlas connected successfully to database: ${connection.connection.db.databaseName}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;