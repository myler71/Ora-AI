const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Analysis Chat",
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
