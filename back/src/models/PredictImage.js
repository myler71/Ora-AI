const mongoose = require("mongoose");

const predictImageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    prediction: {
      type: String,
      trim: true,
    },
    confidence: {
      type: Number,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PredictImage", predictImageSchema);
