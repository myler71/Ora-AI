const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const db = await mongoose.connect(mongoURI);
  isConnected = true;
  console.log("MongoDB connected");
  return db;
};

module.exports = connectDB;
