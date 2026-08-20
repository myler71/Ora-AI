import { axiosInstance } from "./axiosInstance";

export interface ToothState {
  condition: string;
  restoration: string;
  surface: string;
  attention: boolean;
}

export interface ToothEntry {
  _id?: string;
  toothId: string;
  state: ToothState;
  notes?: string;
  updatedAt?: string;
}

export interface MedicalHistoryItem {
  _id?: string;
  condition: string;
  diagnosedAt?: string;
  status: string;
  notes?: string;
}

export interface MedicationItem {
  _id?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface AllergyItem {
  _id?: string;
  allergen: string;
  reaction?: string;
  severity: "mild" | "moderate" | "severe";
  notes?: string;
}

export interface PatientNoteItem {
  _id?: string;
  text: string;
  category?: "general" | "diagnosis" | "treatment" | "tooth-history";
  isRagIndexed?: boolean;
  ragStatus?: "pending" | "indexed" | "failed";
  vectorDbId?: string;
  author?: string;
  createdAt?: string;
}

export interface AttachmentItem {
  _id?: string;
  fileName: string;
  url: string;
  mimeType?: string;
  tag?: string;
  uploadedAt?: string;
}

export interface ResearchItem {
  _id?: string;
  title: string;
  url?: string;
  source?: string;
  summary?: string;
  addedAt?: string;
}

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  phone?: string;
  email?: string;
  teeth: ToothEntry[];
  medicalHistory: MedicalHistoryItem[];
  medications: MedicationItem[];
  allergies: AllergyItem[];
  notes: PatientNoteItem[];
  attachments: AttachmentItem[];
  research: ResearchItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicalEvent {
  _id: string;
  patient: string;
  toothId?: string | null;
  doctor: string;
  date: string;
  durationMin?: number;
  type: string;
  title: string;
  description?: string;
}

export interface Appointment {
  _id: string;
  patient: Patient | string;
  doctor: string;
  dateTime: string;
  durationMin?: number;
  type?: string;
  reason?: string;
  status: "scheduled" | "checked-in" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

export interface AIReportItem {
  _id: string;
  patient: Patient | { _id: string; firstName: string; lastName: string };
  scope: string;
  toothId?: string;
  status: "pending" | "awaiting-review" | "reviewed" | "rejected";
  contextSnapshot: Record<string, unknown>;
  result?: Record<string, unknown>;
  createdAt: string;
}

export interface PredictScanItem {
  _id: string;
  prediction: string;
  confidence: number;
  imageUrl: string;
  createdAt: string;
}

export interface DoctorNoteItem {
  _id: string;
  text: string;
  pinned: boolean;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  item: string;
  quantity: number;
  threshold: number;
  status: string;
  isLow: boolean;
}

export interface DashboardResponse {
  todaysAppointments: Appointment[];
  attentionCases: Patient[];
  pendingAIReports: AIReportItem[];
  awaitingReviewAIReports: AIReportItem[];
  recentPatients: Patient[];
  researchLinks: Array<ResearchItem & { patientName?: string; patientId?: string }>;
  doctorNotes: DoctorNoteItem[];
  totalPatients: number;
}

export interface ChatSession {
  _id: string;
  title: string;
  patient?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  session: string;
  sender: "user" | "assistant";
  text: string;
  isStub?: boolean;
  createdAt: string;
}

export const clinicalService = {
  // Dashboard & Inventory
  getDashboard: async (): Promise<DashboardResponse> => {
    const { data } = await axiosInstance.get<DashboardResponse>("/api/dashboard");
    return data;
  },

  getInventory: async (): Promise<{ isMock: boolean; inventory: InventoryItem[] }> => {
    const { data } = await axiosInstance.get("/api/inventory");
    return data;
  },

  // Doctor Scratchpad Notes
  getDoctorNotes: async (): Promise<{ notes: DoctorNoteItem[] }> => {
    const { data } = await axiosInstance.get("/api/doctor-notes");
    return data;
  },
  createDoctorNote: async (text: string, pinned = false): Promise<{ note: DoctorNoteItem }> => {
    const { data } = await axiosInstance.post("/api/doctor-notes", { text, pinned });
    return data;
  },
  deleteDoctorNote: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/api/doctor-notes/${id}`);
    return data;
  },

  // Patients
  getPatients: async (search?: string): Promise<{ patients: Patient[] }> => {
    const { data } = await axiosInstance.get("/api/patients", { params: { search } });
    return data;
  },
  createPatient: async (payload: Partial<Patient>): Promise<{ patient: Patient }> => {
    const { data } = await axiosInstance.post("/api/patients", payload);
    return data;
  },
  getPatientById: async (id: string): Promise<{ patient: Patient; scans?: PredictScanItem[] }> => {
    const { data } = await axiosInstance.get(`/api/patients/${id}`);
    return data;
  },
  updatePatient: async (id: string, payload: Partial<Patient>): Promise<{ patient: Patient }> => {
    const { data } = await axiosInstance.patch(`/api/patients/${id}`, payload);
    return data;
  },
  deletePatient: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/api/patients/${id}`);
    return data;
  },

  // Per-Tooth Upsert (FDI Notation)
  upsertToothState: async (
    patientId: string,
    toothId: string,
    state: Partial<ToothState>,
    notes?: string,
  ): Promise<{ tooth: ToothEntry; patient: Patient }> => {
    const { data } = await axiosInstance.patch(`/api/patients/${patientId}/teeth/${toothId}`, {
      state,
      notes,
    });
    return data;
  },

  // Clinical Events
  getPatientEvents: async (
    patientId: string,
    toothId?: string,
  ): Promise<{ events: ClinicalEvent[] }> => {
    const { data } = await axiosInstance.get(`/api/patients/${patientId}/events`, {
      params: { toothId },
    });
    return data;
  },
  addPatientEvent: async (
    patientId: string,
    event: Partial<ClinicalEvent>,
  ): Promise<{ event: ClinicalEvent }> => {
    const { data } = await axiosInstance.post(`/api/patients/${patientId}/events`, event);
    return data;
  },

  // Patient Subdocuments
  addPatientNote: async (
    patientId: string,
    text: string,
    category = "general",
    isRagIndexed = true,
  ): Promise<{ notes: PatientNoteItem[] }> => {
    const { data } = await axiosInstance.post(`/api/patients/${patientId}/notes`, {
      text,
      category,
      isRagIndexed,
    });
    return data;
  },
  addMedication: async (patientId: string, item: Partial<MedicationItem>): Promise<{ patient: Patient }> => {
    const { data } = await axiosInstance.post(`/api/patients/${patientId}/medications`, item);
    return data;
  },
  addAllergy: async (patientId: string, item: Partial<AllergyItem>): Promise<{ patient: Patient }> => {
    const { data } = await axiosInstance.post(`/api/patients/${patientId}/allergies`, item);
    return data;
  },
  addMedicalHistory: async (patientId: string, item: Partial<MedicalHistoryItem>): Promise<{ patient: Patient }> => {
    const { data } = await axiosInstance.post(`/api/patients/${patientId}/medical-history`, item);
    return data;
  },
  addResearch: async (patientId: string, item: Partial<ResearchItem>): Promise<{ patient: Patient }> => {
    const { data } = await axiosInstance.post(`/api/patients/${patientId}/research`, item);
    return data;
  },
  uploadAttachment: async (patientId: string, file: File, tag = "general"): Promise<{ patient: Patient }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tag", tag);
    const { data } = await axiosInstance.post(`/api/patients/${patientId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  // Appointments
  getAppointments: async (from?: string, to?: string): Promise<{ appointments: Appointment[] }> => {
    const { data } = await axiosInstance.get("/api/appointments", { params: { from, to } });
    return data;
  },
  createAppointment: async (payload: Partial<Appointment> & { patientId: string }): Promise<{ appointment: Appointment }> => {
    const { data } = await axiosInstance.post("/api/appointments", payload);
    return data;
  },
  updateAppointment: async (id: string, payload: Partial<Appointment>): Promise<{ appointment: Appointment }> => {
    const { data } = await axiosInstance.patch(`/api/appointments/${id}`, payload);
    return data;
  },

  // AI & Reports
  analyzeTooth: async (
    patientId: string,
    toothId: string,
  ): Promise<{ status: string; message: string; reportId: string; contextSnapshot: Record<string, unknown>; result: Record<string, unknown> }> => {
    const { data } = await axiosInstance.post("/api/ai/analyze-tooth", { patientId, toothId });
    return data;
  },
  getAIReports: async (patientId?: string, status?: string): Promise<{ reports: AIReportItem[] }> => {
    const { data } = await axiosInstance.get("/api/ai/reports", { params: { patientId, status } });
    return data;
  },
  updateAIReportStatus: async (id: string, status: "reviewed" | "rejected"): Promise<{ report: AIReportItem }> => {
    const { data } = await axiosInstance.patch(`/api/ai/reports/${id}`, { status });
    return data;
  },

  // Chat
  getChatSessions: async (): Promise<{ sessions: ChatSession[] }> => {
    const { data } = await axiosInstance.get("/api/chat/sessions");
    return data;
  },
  createChatSession: async (title?: string, patientId?: string): Promise<{ session: ChatSession }> => {
    const { data } = await axiosInstance.post("/api/chat/sessions", { title, patientId });
    return data;
  },
  getChatMessages: async (sessionId: string): Promise<{ messages: ChatMessage[] }> => {
    const { data } = await axiosInstance.get(`/api/chat/sessions/${sessionId}/messages`);
    return data;
  },
  sendChatMessage: async (sessionId: string, text: string): Promise<{ status: string; message: string; userMessage: ChatMessage; assistantMessage: ChatMessage }> => {
    const { data } = await axiosInstance.post(`/api/chat/sessions/${sessionId}/messages`, { text });
    return data;
  },
};
