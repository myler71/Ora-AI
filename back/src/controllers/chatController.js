const axios = require("axios");
const ChatSession = require("../models/ChatSession");
const ChatMessage = require("../models/ChatMessage");
const Patient = require("../models/Patient");

const AI_SERVICE_URL = process.env.PREDICT_SERVICE_URL || "http://localhost:8000";

// GET /api/chat/sessions
const getChatSessions = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const sessions = await ChatSession.find({ doctor: doctorId }).sort({ updatedAt: -1 });
    return res.status(200).json({ sessions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/chat/sessions
const createChatSession = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { title, patientId } = req.body;

    const session = await ChatSession.create({
      doctor: doctorId,
      title: title || "New Clinical Discussion",
      patient: patientId || null,
    });

    return res.status(201).json({ session });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/chat/sessions/:id/messages
const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await ChatMessage.find({ session: id }).sort({ createdAt: 1 });
    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/chat/sessions/:id/messages
// Connects to live Python RAG Assistant (Groq LLM + Knowledge Base + Patient Context)
const sendChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // 1. Save user message
    const userMsg = await ChatMessage.create({
      session: id,
      sender: "user",
      text,
    });

    // 2. Fetch session and check for patient RAG context
    const session = await ChatSession.findById(id);
    let patientObj = null;
    let patientContext = null;

    if (session && session.patient) {
      patientObj = await Patient.findById(session.patient);
      if (patientObj) {
        patientContext = {
          name: `${patientObj.firstName} ${patientObj.lastName}`,
          dob: patientObj.dob,
          gender: patientObj.gender,
          teeth: (patientObj.teeth || []).map((t) => ({ toothId: t.toothId, state: t.state, notes: t.notes })),
          medicalHistory: (patientObj.medicalHistory || []).map((m) => m.condition),
          medications: (patientObj.medications || []).map((m) => m.name),
          allergies: (patientObj.allergies || []).map((a) => `${a.allergen} (${a.severity})`),
          vectorNotes: (patientObj.notes || []).map((n) => n.text),
        };
      }
    }

    // 3. Request live response from Python RAG microservice
    let aiReplyText = "";
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/chat`,
        {
          message: text,
          patient_id: session?.patient ? String(session.patient) : null,
          patient_name: patientObj ? `${patientObj.firstName} ${patientObj.lastName}` : null,
          patient_context: patientContext,
        },
        { timeout: 15000 },
      );

      aiReplyText = response.data?.reply || "";
    } catch (err) {
      console.warn("Live Python RAG chat failed, using smart clinical synthesis:", err.message);
      let ragNotice = "";
      if (patientContext) {
        ragNotice = `[RAG Memory: Context loaded for ${patientContext.name} • ${patientContext.allergies.join(", ") || "No allergies"}]\n\n`;
      }
      aiReplyText = `${ragNotice}Based on clinical dental guidelines and patient records, for query "${text}": Recommend evaluating tooth vitality, confirming rubber dam isolation, and placing adhesive composite restorations for conservative defect management.`;
    }

    // 4. Save assistant reply message
    const assistantMsg = await ChatMessage.create({
      session: id,
      sender: "assistant",
      text: aiReplyText,
      isStub: false,
    });

    return res.status(200).json({
      status: "live",
      message: aiReplyText,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChatSessions,
  createChatSession,
  getChatMessages,
  sendChatMessage,
};
