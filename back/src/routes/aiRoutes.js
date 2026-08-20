const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  analyzeTooth,
  getAIReports,
  updateAIReportStatus,
} = require("../controllers/aiController");

const router = express.Router();

router.post("/ai/analyze-tooth", protect, analyzeTooth);
router.get("/ai/reports", protect, getAIReports);
router.patch("/ai/reports/:id", protect, updateAIReportStatus);

module.exports = router;
