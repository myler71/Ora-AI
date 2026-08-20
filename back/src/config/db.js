const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn("Warning: MONGO_URI is not defined in environment variables");
    return null;
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
