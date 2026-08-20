const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dateTime: {
      type: Date,
      required: true,
      index: true,
    },
    durationMin: {
      type: Number,
      default: 30,
    },
    type: {
      type: String,
      default: "Consultation",
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "checked-in", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
