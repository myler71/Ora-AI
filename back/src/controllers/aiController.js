const Patient = require("../models/Patient");
const ClinicalEvent = require("../models/ClinicalEvent");
const AIReport = require("../models/AIReport");
const PredictImage = require("../models/PredictImage");
const { analyzeToothStub } = require("../services/aiClient");

// POST /api/ai/analyze-tooth { patientId, toothId }
const analyzeTooth = async (req, res) => {
  try {
    const { patientId, toothId } = req.body;

    if (!patientId || !toothId) {
      return res.status(400).json({ message: "patientId and toothId are required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const clinicalEvents = await ClinicalEvent.find({ patient: patientId });
    const priorPredictions = await PredictImage.find({ user: req.user._id });

    // Call stub interface
    const stubAnalysis = await analyzeToothStub({
      patient,
      toothId: String(toothId),
      clinicalEvents,
      priorPredictions,
    });

    // Create AIReport record in database
    const report = await AIReport.create({
      patient: patient._id,
      scope: "tooth",
      toothId: String(toothId),
      status: "awaiting-review",
      contextSnapshot: stubAnalysis.contextSnapshot,
      result: stubAnalysis.result,
    });

    return res.status(200).json({
      status: "stub",
      message: stubAnalysis.stubMessage,
      reportId: report._id,
      contextSnapshot: stubAnalysis.contextSnapshot,
      result: stubAnalysis.result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/ai/reports
const getAIReports = async (req, res) => {
  try {
    const { patientId, status } = req.query;
    const query = {};
    if (patientId) query.patient = patientId;
    if (status) query.status = status;

    const reports = await AIReport.find(query)
      .populate("patient", "firstName lastName")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reports });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/ai/reports/:id
const updateAIReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'reviewed' | 'rejected'

    const report = await AIReport.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true },
    );

    return res.status(200).json({ message: "Report status updated", report });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { analyzeTooth, getAIReports, updateAIReportStatus };
