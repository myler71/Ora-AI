const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getChatSessions,
  createChatSession,
  getChatMessages,
  sendChatMessage,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/chat/sessions", protect, getChatSessions);
router.post("/chat/sessions", protect, createChatSession);
router.get("/chat/sessions/:id/messages", protect, getChatMessages);
router.post("/chat/sessions/:id/messages", protect, sendChatMessage);

module.exports = router;
