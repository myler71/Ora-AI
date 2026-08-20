const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const predictRoutes = require("./routes/predictRoutes");
const clinicalRoutes = require("./routes/clinicalRoutes");
const aiRoutes = require("./routes/aiRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", predictRoutes);
app.use("/api", clinicalRoutes);
app.use("/api", aiRoutes);
app.use("/api", chatRoutes);
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Ora AI Dental Backend API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
