const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isStub: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
