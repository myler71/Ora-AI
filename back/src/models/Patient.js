const mongoose = require("mongoose");

const toothStateSchema = new mongoose.Schema(
  {
    condition: { type: String, default: "healthy" },
    restoration: { type: String, default: "none" },
    surface: { type: String, default: "sound" },
    attention: { type: Boolean, default: false },
  },
  { _id: false },
);

const toothSchema = new mongoose.Schema({
  toothId: { type: String, required: true }, // FDI notation (e.g. "36")
  state: { type: toothStateSchema, default: () => ({}) },
  notes: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

const medicalHistorySchema = new mongoose.Schema({
  condition: { type: String, required: true },
  diagnosedAt: { type: Date, default: Date.now },
  status: { type: String, default: "active" }, // active, resolved
  notes: { type: String, default: "" },
});

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, default: "" },
  frequency: { type: String, default: "" },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  notes: { type: String, default: "" },
});

const allergySchema = new mongoose.Schema({
  allergen: { type: String, required: true },
  reaction: { type: String, default: "" },
  severity: { type: String, enum: ["mild", "moderate", "severe"], default: "mild" },
  notes: { type: String, default: "" },
});

const patientNoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  category: {
    type: String,
    enum: ["general", "diagnosis", "treatment", "tooth-history"],
    default: "general",
  },
  isRagIndexed: { type: Boolean, default: true },
  ragStatus: {
    type: String,
    enum: ["pending", "indexed", "failed"],
    default: "indexed",
  },
  vectorDbId: { type: String, default: null },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String, default: "image/jpeg" },
  tag: { type: String, default: "general" },
  uploadedAt: { type: Date, default: Date.now },
});

const researchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: "" },
  source: { type: String, default: "PubMed" },
  summary: { type: String, default: "" },
  addedAt: { type: Date, default: Date.now },
});

const patientSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"], default: "male" },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    medicalHistory: [medicalHistorySchema],
    medications: [medicationSchema],
    allergies: [allergySchema],
    teeth: [toothSchema], // Subdocuments with individual _ids for per-tooth state & history
    notes: [patientNoteSchema],
    attachments: [attachmentSchema],
    research: [researchSchema],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Patient", patientSchema);
