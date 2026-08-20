const { app, connectDB } = require("../src/app");

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("Database connection error in serverless handler:", err);
    return res.status(500).json({
      error: "Database connection failed",
      details: err.message,
    });
  }
};
