const express = require("express");
const {
  signup,
  signin,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

const prefix = "/auth";

router.post(`${prefix}/signup`, signup);
router.post(`${prefix}/signin`, signin);
router.post(`${prefix}/forgot-password`, forgotPassword);
router.post(`${prefix}/verify-otp`, verifyOtp);
router.post(`${prefix}/reset-password`, resetPassword);

module.exports = router;
