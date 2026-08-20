const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const {
  predictFromImage,
  getPredictHistory,
  getPredictHistoryById,
} = require("../controllers/predictController");
const { optionalProtect, protect } = require("../middlewares/authMiddleware");

const assetsPredictDir = path.join(process.cwd(), "assets", "predict");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(assetsPredictDir, { recursive: true });
    cb(null, assetsPredictDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    cb(null, `${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    return cb(null, true);
  },
});

const router = express.Router();
const prefix = "/predict";

const handleMulter = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    return next();
  });
};

router.post(`${prefix}/image`, optionalProtect, handleMulter, predictFromImage);
router.get(`${prefix}/history`, protect, getPredictHistory);
router.get(`${prefix}/history/:id`, protect, getPredictHistoryById);

module.exports = router;
