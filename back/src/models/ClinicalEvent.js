const mongoose = require("mongoose");

const clinicalEventSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    toothId: {
      type: String,
      default: null,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    durationMin: {
      type: Number,
      default: 30,
    },
    type: {
      type: String,
      enum: [
        "appointment",
        "diagnosis",
        "treatment",
        "procedure",
        "medication",
        "allergy",
        "note",
        "attachment",
        "ai-analysis",
      ],
      default: "treatment",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ClinicalEvent", clinicalEventSchema);
