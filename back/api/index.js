const app = require("../src/app");
const connectDB = require("../src/config/db");

module.exports = async (req, res) => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    }
    return app(req, res);
  } catch (err) {
    console.error("Database connection error in serverless handler:", err);
    return res.status(500).json({
      error: "Database connection failed",
      details: err.message,
    });
  }
};
