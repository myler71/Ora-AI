import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Appointment,
  ClinicalEvent,
  Patient,
  ToothState,
} from "../services/clinical.service";
import { clinicalService } from "../services/clinical.service";

export const CLINICAL_KEYS = {
  dashboard: ["clinical", "dashboard"] as const,
  inventory: ["clinical", "inventory"] as const,
  doctorNotes: ["clinical", "doctorNotes"] as const,
  patients: (search?: string) => ["clinical", "patients", search || ""] as const,
  patient: (id: string) => ["clinical", "patient", id] as const,
  patientEvents: (patientId: string, toothId?: string) =>
    ["clinical", "events", patientId, toothId || ""] as const,
  appointments: (from?: string, to?: string) =>
    ["clinical", "appointments", from || "", to || ""] as const,
  aiReports: (patientId?: string, status?: string) =>
    ["clinical", "aiReports", patientId || "", status || ""] as const,
  chatSessions: ["clinical", "chatSessions"] as const,
  chatMessages: (sessionId: string) =>
    ["clinical", "chatMessages", sessionId] as const,
};

// Dashboard & Inventory Queries
export const useDashboardQuery = (enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.dashboard,
    queryFn: () => clinicalService.getDashboard(),
    enabled,
  });

export const useInventoryQuery = (enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.inventory,
    queryFn: () => clinicalService.getInventory(),
    enabled,
  });

// Doctor Notes Scratchpad
export const useDoctorNotesQuery = (enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.doctorNotes,
    queryFn: () => clinicalService.getDoctorNotes(),
    enabled,
  });

export const useCreateDoctorNoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ text, pinned }: { text: string; pinned?: boolean }) =>
      clinicalService.createDoctorNote(text, pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.doctorNotes });
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.dashboard });
    },
  });
};

export const useDeleteDoctorNoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicalService.deleteDoctorNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.doctorNotes });
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.dashboard });
    },
  });
};

// Patients Queries & Mutations
export const usePatientsQuery = (search?: string, enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.patients(search),
    queryFn: () => clinicalService.getPatients(search),
    enabled,
  });

export const usePatientQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.patient(id),
    queryFn: () => clinicalService.getPatientById(id),
    enabled: Boolean(id) && enabled,
  });

export const useCreatePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Patient>) => clinicalService.createPatient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical", "patients"] });
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.dashboard });
    },
  });
};

export const useUpdatePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Patient> }) =>
      clinicalService.updatePatient(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.patient(id) });
      queryClient.invalidateQueries({ queryKey: ["clinical", "patients"] });
    },
  });
};

// Per-Tooth Upsert (FDI Notation)
export const useUpsertToothStateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      toothId,
      state,
      notes,
    }: {
      patientId: string;
      toothId: string;
      state: Partial<ToothState>;
      notes?: string;
    }) => clinicalService.upsertToothState(patientId, toothId, state, notes),
    onSuccess: (_, { patientId, toothId }) => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.patient(patientId) });
      queryClient.invalidateQueries({
        queryKey: CLINICAL_KEYS.patientEvents(patientId, toothId),
      });
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.dashboard });
    },
  });
};

// Clinical Events
export const usePatientEventsQuery = (
  patientId: string,
  toothId?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: CLINICAL_KEYS.patientEvents(patientId, toothId),
    queryFn: () => clinicalService.getPatientEvents(patientId, toothId),
    enabled: Boolean(patientId) && enabled,
  });

export const useAddPatientEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      event,
    }: {
      patientId: string;
      event: Partial<ClinicalEvent>;
    }) => clinicalService.addPatientEvent(patientId, event),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.patient(patientId) });
      queryClient.invalidateQueries({ queryKey: ["clinical", "events"] });
    },
  });
};

// Appointments
export const useAppointmentsQuery = (from?: string, to?: string, enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.appointments(from, to),
    queryFn: () => clinicalService.getAppointments(from, to),
    enabled,
  });

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Appointment> & { patientId: string }) =>
      clinicalService.createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical", "appointments"] });
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.dashboard });
    },
  });
};

export const useUpdateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Appointment> }) =>
      clinicalService.updateAppointment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical", "appointments"] });
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.dashboard });
    },
  });
};

// AI & Reports
export const useAnalyzeToothMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, toothId }: { patientId: string; toothId: string }) =>
      clinicalService.analyzeTooth(patientId, toothId),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.patient(patientId) });
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.dashboard });
      queryClient.invalidateQueries({ queryKey: ["clinical", "aiReports"] });
    },
  });
};

export const useAIReportsQuery = (patientId?: string, status?: string, enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.aiReports(patientId, status),
    queryFn: () => clinicalService.getAIReports(patientId, status),
    enabled,
  });

export const useUpdateAIReportStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "reviewed" | "rejected" }) =>
      clinicalService.updateAIReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinical", "aiReports"] });
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.dashboard });
    },
  });
};

// Chat Queries & Mutations
export const useChatSessionsQuery = (enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.chatSessions,
    queryFn: () => clinicalService.getChatSessions(),
    enabled,
  });

export const useCreateChatSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, patientId }: { title?: string; patientId?: string }) =>
      clinicalService.createChatSession(title, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.chatSessions });
    },
  });
};

export const useChatMessagesQuery = (sessionId: string, enabled = true) =>
  useQuery({
    queryKey: CLINICAL_KEYS.chatMessages(sessionId),
    queryFn: () => clinicalService.getChatMessages(sessionId),
    enabled: Boolean(sessionId) && enabled,
  });

export const useSendChatMessageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, text }: { sessionId: string; text: string }) =>
      clinicalService.sendChatMessage(sessionId, text),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_KEYS.chatMessages(sessionId) });
    },
  });
};
