const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const prefix = "/users";

router.get(`${prefix}/me`, protect, getMyProfile);
router.patch(`${prefix}/me`, protect, updateMyProfile);
router.delete(`${prefix}/me`, protect, deleteMyProfile);

module.exports = router;
