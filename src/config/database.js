const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.DB_CONNECTION_SECRET, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

module.exports = connectDB;
