const mongoose = require("mongoose");

const aiReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ["tooth", "patient", "chat"],
      default: "tooth",
    },
    toothId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "awaiting-review", "reviewed", "rejected"],
      default: "pending",
    },
    contextSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AIReport", aiReportSchema);
