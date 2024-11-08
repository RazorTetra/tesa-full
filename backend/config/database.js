// backend/config/database.js
const mongoose = require("mongoose");

// Singleton connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    const opts = {
      maxPoolSize: 1, // Strict limit on connections
      minPoolSize: 1, // Keep one connection alive
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,  
      family: 4
    };

    await mongoose.connect(MONGODB_URI, opts);
    
    isConnected = true;
    console.log('New database connection established');

    // Handle disconnection events
    mongoose.connection.on('disconnected', () => {
      console.log('DB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('DB connection error:', err);
      isConnected = false;
    });

  } catch (error) {
    console.error('Could not connect to DB:', error);
    // Reset flag so next request tries to connect again
    isConnected = false;
    throw error;
  }
};

module.exports = connectDB;