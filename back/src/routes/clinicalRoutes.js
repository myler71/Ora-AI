const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { protect } = require("../middlewares/authMiddleware");
const {
  getPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient,
  upsertToothState,
  getPatientEvents,
  addPatientEvent,
  getPatientNotes,
  addPatientNote,
  deletePatientNote,
  addMedication,
  addAllergy,
  addMedicalHistory,
  addResearch,
  getAppointments,
  createAppointment,
  updateAppointment,
  getDashboardData,
  getInventory,
  getDoctorNotes,
  createDoctorNote,
  deleteDoctorNote,
  getNotifications,
  markNotificationRead,
} = require("../controllers/clinicalController");

const router = express.Router();

// Multer setup for patient attachments
const assetsPatientDir = path.join(process.cwd(), "assets", "patient");
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(assetsPatientDir, { recursive: true });
    cb(null, assetsPatientDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    cb(null, `${base}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
});

// Dashboard & Inventory
router.get("/dashboard", protect, getDashboardData);
router.get("/inventory", protect, getInventory);

// Doctor Notes Scratchpad
router.get("/doctor-notes", protect, getDoctorNotes);
router.post("/doctor-notes", protect, createDoctorNote);
router.delete("/doctor-notes/:id", protect, deleteDoctorNote);

// Appointments
router.get("/appointments", protect, getAppointments);
router.post("/appointments", protect, createAppointment);
router.patch("/appointments/:id", protect, updateAppointment);

// Patients CRUD
router.get("/patients", protect, getPatients);
router.post("/patients", protect, createPatient);
router.get("/patients/:id", protect, getPatientById);
router.patch("/patients/:id", protect, updatePatient);
router.delete("/patients/:id", protect, deletePatient);

// Per-Tooth Upsert (FDI Notation)
router.patch("/patients/:id/teeth/:toothId", protect, upsertToothState);

// Clinical Events (Timeline & Tooth History)
router.get("/patients/:id/events", protect, getPatientEvents);
router.post("/patients/:id/events", protect, addPatientEvent);

// Patient Subdocuments
router.get("/patients/:id/notes", protect, getPatientNotes);
router.post("/patients/:id/notes", protect, addPatientNote);
router.delete("/patients/:id/notes/:noteId", protect, deletePatientNote);
router.post("/patients/:id/medications", protect, addMedication);
router.post("/patients/:id/allergies", protect, addAllergy);
router.post("/patients/:id/medical-history", protect, addMedicalHistory);
router.post("/patients/:id/research", protect, addResearch);

// Attachments
router.post("/patients/:id/attachments", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File is required" });
    const relativeUrl = `assets/patient/${req.file.filename}`;
    const Patient = require("../models/Patient");
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.attachments.push({
      fileName: req.file.originalname,
      url: relativeUrl,
      mimeType: req.file.mimetype,
      tag: req.body.tag || "general",
    });
    await patient.save();

    return res.status(201).json({ message: "Attachment uploaded", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Notifications
router.get("/notifications", protect, getNotifications);
router.patch("/notifications/:id/read", protect, markNotificationRead);

module.exports = router;
