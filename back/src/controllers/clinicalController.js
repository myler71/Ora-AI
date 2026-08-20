const Patient = require("../models/Patient");
const ClinicalEvent = require("../models/ClinicalEvent");
const Appointment = require("../models/Appointment");
const AIReport = require("../models/AIReport");
const DoctorNote = require("../models/DoctorNote");
const PredictImage = require("../models/PredictImage");

// GET /api/patients
const getPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { search } = req.query;

    const query = { doctor: doctorId, isDeleted: false };
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ firstName: regex }, { lastName: regex }, { phone: regex }];
    }

    const patients = await Patient.find(query).sort({ updatedAt: -1 });
    return res.status(200).json({ patients });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/patients
const createPatient = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { firstName, lastName, dob, gender, phone, email } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    const patient = await Patient.create({
      doctor: doctorId,
      firstName,
      lastName,
      dob: dob ? new Date(dob) : undefined,
      gender: gender || "male",
      phone: phone || "",
      email: email || "",
    });

    return res.status(201).json({ message: "Patient created successfully", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/patients/:id
const getPatientById = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id } = req.params;

    const patient = await Patient.findOne({ _id: id, doctor: doctorId, isDeleted: false });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Fetch AI scan predictions linked to doctor/patient
    const scans = await PredictImage.find({ user: doctorId }).sort({ createdAt: -1 });

    return res.status(200).json({ patient, scans });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/patients/:id
const updatePatient = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id } = req.params;

    const patient = await Patient.findOneAndUpdate(
      { _id: id, doctor: doctorId, isDeleted: false },
      { $set: req.body },
      { new: true },
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({ message: "Patient updated successfully", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/patients/:id
const deletePatient = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id } = req.params;

    const patient = await Patient.findOneAndUpdate(
      { _id: id, doctor: doctorId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/patients/:id/teeth/:toothId
// Upserts a tooth subdocument, ensuring each tooth datum has its OWN _id
const upsertToothState = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id, toothId } = req.params;
    const { state, notes } = req.body;

    const patient = await Patient.findOne({ _id: id, doctor: doctorId, isDeleted: false });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    let tooth = patient.teeth.find((t) => t.toothId === String(toothId));

    if (tooth) {
      if (state) tooth.state = { ...tooth.state, ...state };
      if (notes !== undefined) tooth.notes = notes;
      tooth.updatedAt = new Date();
    } else {
      patient.teeth.push({
        toothId: String(toothId),
        state: state || { condition: "healthy", restoration: "none", surface: "sound", attention: false },
        notes: notes || "",
        updatedAt: new Date(),
      });
      tooth = patient.teeth[patient.teeth.length - 1];
    }

    await patient.save();

    // Log a clinical event for tooth update
    await ClinicalEvent.create({
      patient: patient._id,
      toothId: String(toothId),
      doctor: doctorId,
      date: new Date(),
      type: "diagnosis",
      title: `Updated Tooth ${toothId} State`,
      description: `Condition: ${tooth.state.condition}, Restoration: ${tooth.state.restoration}, Attention: ${tooth.state.attention}`,
    });

    return res.status(200).json({
      message: "Tooth state updated successfully",
      tooth,
      patient,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/patients/:id/events
const getPatientEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { toothId, from, to } = req.query;

    const query = { patient: id };
    if (toothId) query.toothId = String(toothId);
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const events = await ClinicalEvent.find(query).sort({ date: -1 });
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/patients/:id/events
const addPatientEvent = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id } = req.params;
    const { toothId, type, title, description, date, durationMin, metadata } = req.body;

    const event = await ClinicalEvent.create({
      patient: id,
      toothId: toothId ? String(toothId) : null,
      doctor: doctorId,
      type: type || "treatment",
      title: title || "Clinical Procedure",
      description: description || "",
      date: date ? new Date(date) : new Date(),
      durationMin: durationMin || 30,
      metadata: metadata || {},
    });

    return res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET/POST/DELETE Patient Doctor Notes
const getPatientNotes = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id } = req.params;

    const patient = await Patient.findOne({ _id: id, doctor: doctorId, isDeleted: false });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    return res.status(200).json({ notes: patient.notes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addPatientNote = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id } = req.params;
    const { text, category, isRagIndexed } = req.body;

    if (!text) return res.status(400).json({ message: "Note text is required" });

    const patient = await Patient.findOne({ _id: id, doctor: doctorId, isDeleted: false });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const shouldIndex = isRagIndexed !== undefined ? Boolean(isRagIndexed) : true;
    const vectorDbId = shouldIndex ? `vec_note_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}` : null;

    patient.notes.push({
      text,
      category: category || "general",
      isRagIndexed: shouldIndex,
      ragStatus: shouldIndex ? "indexed" : "pending",
      vectorDbId,
      author: doctorId,
    });
    await patient.save();

    return res.status(201).json({ message: "Note added and indexed into Vector DB for RAG", notes: patient.notes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deletePatientNote = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { id, noteId } = req.params;

    const patient = await Patient.findOne({ _id: id, doctor: doctorId, isDeleted: false });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.notes = patient.notes.filter((n) => String(n._id) !== String(noteId));
    await patient.save();

    return res.status(200).json({ message: "Note deleted successfully", notes: patient.notes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add Medication, Allergy, Medical History, Research
const addMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.medications.push(req.body);
    await patient.save();
    return res.status(201).json({ message: "Medication added", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addAllergy = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.allergies.push(req.body);
    await patient.save();
    return res.status(201).json({ message: "Allergy added", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.medicalHistory.push(req.body);
    await patient.save();
    return res.status(201).json({ message: "Medical history added", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addResearch = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.research.push(req.body);
    await patient.save();
    return res.status(201).json({ message: "Research link added", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Appointments
const getAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { from, to } = req.query;

    const query = { doctor: doctorId };
    if (from || to) {
      query.dateTime = {};
      if (from) query.dateTime.$gte = new Date(from);
      if (to) query.dateTime.$lte = new Date(to);
    }

    const appointments = await Appointment.find(query)
      .populate("patient", "firstName lastName phone email teeth")
      .sort({ dateTime: 1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId, dateTime, durationMin, type, reason, notes } = req.body;

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      dateTime: new Date(dateTime),
      durationMin: durationMin || 30,
      type: type || "Consultation",
      reason: reason || "",
      notes: notes || "",
    });

    return res.status(201).json({ message: "Appointment created", appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    return res.status(200).json({ message: "Appointment updated", appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard — Command Center Payload (8 cards)
const getDashboardData = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // 1. Today's appointments
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAppointments = await Appointment.find({
      doctor: doctorId,
      dateTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("patient", "firstName lastName phone teeth")
      .sort({ dateTime: 1 });

    // 2. Patients & Attention cases
    const patients = await Patient.find({ doctor: doctorId, isDeleted: false });
    const attentionCases = patients.filter((p) =>
      p.teeth.some((t) => t.state && t.state.attention),
    );

    // 3. Pending AI Reports
    const pendingAIReports = await AIReport.find({
      status: "pending",
    }).populate("patient", "firstName lastName");

    // 4. AI Recommendations Awaiting Review
    const awaitingReviewAIReports = await AIReport.find({
      status: "awaiting-review",
    }).populate("patient", "firstName lastName");

    // 5. Recent Patients
    const recentPatients = await Patient.find({ doctor: doctorId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(5);

    // 6. Research links aggregate
    const researchLinks = patients.flatMap((p) =>
      (p.research || []).map((r) => ({
        ...r.toObject(),
        patientName: `${p.firstName} ${p.lastName}`,
        patientId: p._id,
      })),
    ).slice(0, 5);

    // 7. Doctor Notes (scratchpad)
    const doctorNotes = await DoctorNote.find({ doctor: doctorId }).sort({ pinned: -1, createdAt: -1 });

    return res.status(200).json({
      todaysAppointments,
      attentionCases,
      pendingAIReports,
      awaitingReviewAIReports,
      recentPatients,
      researchLinks,
      doctorNotes,
      totalPatients: patients.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/inventory — Mock rows
const getInventory = async (_req, res) => {
  // TODO: replace with real Inventory model in future releases
  return res.status(200).json({
    isMock: true,
    inventory: [
      { id: "1", item: "Composite Resin (A2)", quantity: 4, threshold: 10, status: "Low Stock", isLow: true },
      { id: "2", item: "Dental Anesthetic (Lidocaine 2%)", quantity: 45, threshold: 20, status: "In Stock", isLow: false },
      { id: "3", item: "Sterile Examination Gloves (M)", quantity: 8, threshold: 15, status: "Low Stock", isLow: true },
      { id: "4", item: "Fluoride Varnish Packets", quantity: 30, threshold: 15, status: "In Stock", isLow: false },
      { id: "5", item: "Intraoral Sensor Covers", quantity: 5, threshold: 25, status: "Critical", isLow: true },
    ],
  });
};

// Doctor Notes Scratchpad
const getDoctorNotes = async (req, res) => {
  try {
    const notes = await DoctorNote.find({ doctor: req.user._id }).sort({ pinned: -1, createdAt: -1 });
    return res.status(200).json({ notes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createDoctorNote = async (req, res) => {
  try {
    const { text, pinned } = req.body;
    const note = await DoctorNote.create({ doctor: req.user._id, text, pinned: !!pinned });
    return res.status(201).json({ note });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteDoctorNote = async (req, res) => {
  try {
    await DoctorNote.findOneAndDelete({ _id: req.params.id, doctor: req.user._id });
    return res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, user: req.user._id }, { read: true });
    return res.status(200).json({ message: "Notification marked read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
