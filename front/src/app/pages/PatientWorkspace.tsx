import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAddPatientEventMutation,
  useAIReportsQuery,
  useAnalyzeToothMutation,
  usePatientEventsQuery,
  usePatientQuery,
  useUpdatePatientMutation,
} from "../queries/clinical.query";
import { resolveApiMediaUrl } from "../services/axiosInstance";
import {
  User,
  Activity,
  Pill,
  ShieldAlert,
  Grid,
  History,
  FileText,
  Paperclip,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Plus,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

type WorkspaceTab =
  | "profile"
  | "history"
  | "medications"
  | "allergies"
  | "chart"
  | "treatments"
  | "notes"
  | "attachments"
  | "ai"
  | "research"
  | "timeline";
export default function PatientWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("profile");

  const { data, isLoading } = usePatientQuery(id || "", Boolean(id));
  const { data: eventsData } = usePatientEventsQuery(id || "", undefined, Boolean(id));
  const { data: aiReportsData } = useAIReportsQuery(id, undefined, Boolean(id));

  const updatePatientMutation = useUpdatePatientMutation();
  const addEventMutation = useAddPatientEventMutation();
  const analyzeToothMutation = useAnalyzeToothMutation();

  const [newNoteText, setNewNoteText] = useState("");
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFreq, setMedFreq] = useState("");

  const [algName, setAlgName] = useState("");
  const [algReaction, setAlgReaction] = useState("");
  const [algSeverity, setAlgSeverity] = useState<"mild" | "moderate" | "severe">("moderate");

  const [histCond, setHistCond] = useState("");
  const [histNotes, setHistNotes] = useState("");

  const [evtTitle, setEvtTitle] = useState("");
  const [evtToothId, setEvtToothId] = useState("36");
  const [evtType, setEvtType] = useState("procedure");
  const [evtDesc, setEvtDesc] = useState("");

  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resSummary, setResSummary] = useState("");
  if (isLoading || !data?.patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const patient = data.patient;
  const events = eventsData?.events || [];
  const reports = aiReportsData?.reports || [];
  const attentionTeeth = (patient.teeth || []).filter((t) => t.state?.attention);

  const tabs: Array<{ id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "profile", label: "1. Profile", icon: User },
    { id: "history", label: "2. Medical History", icon: Activity },
    { id: "medications", label: "3. Medications", icon: Pill },
    { id: "allergies", label: "4. Allergies", icon: ShieldAlert },
    { id: "chart", label: "5. Dental Chart", icon: Grid },
    { id: "treatments", label: "6. Treatment History", icon: History },
    { id: "notes", label: "7. Doctor Notes", icon: FileText },
    { id: "attachments", label: "8. Attachments", icon: Paperclip },
    { id: "ai", label: "9. AI Case Analysis", icon: Sparkles },
    { id: "research", label: "10. Research", icon: BookOpen },
    { id: "timeline", label: "11. Unified Timeline", icon: History },
  ];

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
      {/* Back Button */}
      <button
        onClick={() => navigate("/patients")}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Patient Directory
      </button>

      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">
              {patient.firstName} {patient.lastName}
            </h1>
            {attentionTeeth.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {attentionTeeth.length} Tooth Flags (FDI {attentionTeeth.map((t) => t.toothId).join(", ")})
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {patient.gender} • DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"} • Phone: {patient.phone || "N/A"} • Email: {patient.email || "N/A"}
          </p>
        </div>

        <Link
          to={`/patients/${patient._id}/odontogram`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <Grid className="h-4 w-4" />
          Open Full FDI Odontogram & AI Tool
        </Link>
      </div>

      {/* W1: Clinical Safety & Drug Risk Alert Banner */}
      {((patient.allergies || []).some((a) => a.severity === "severe") || (patient.medications || []).length > 0) && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-rose-600 flex-shrink-0 animate-bounce" />
            <div>
              <h4 className="font-extrabold text-rose-900 text-sm">
                CLINICAL SAFETY ALERT — Severe Risk Factors Detected
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Allergies: {(patient.allergies || []).map((a) => `${a.allergen} (${a.severity})`).join(", ") || "None"} • Active Meds: {(patient.medications || []).map((m) => m.name).join(", ") || "None"}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold bg-rose-200 text-rose-900 px-3 py-1 rounded-full uppercase tracking-wider">
            Pre-Op Warning
          </span>
        </div>
      )}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[400px]">
        {/* Tab 1: Profile */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Patient Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">First Name</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium">
                  {patient.firstName}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Last Name</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium">
                  {patient.lastName}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium">
                  {patient.phone || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium">
                  {patient.email || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Medical History */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Medical History Timeline</h2>

            {/* AI Scanning Results Linked Section */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Linked AI Intraoral Scan History ({ (data?.scans || []).length } Scans)
              </h3>
              {(data?.scans || []).length === 0 ? (
                <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  No automated AI intraoral scan records linked yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data?.scans || []).map((scan) => (
                    <div
                      key={scan._id}
                      className="p-4 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 rounded-xl border border-blue-200/80 flex items-start gap-4 shadow-xs"
                    >
                      <img
                        src={resolveApiMediaUrl(scan.imageUrl)}
                        alt={scan.prediction}
                        className="w-16 h-16 rounded-lg object-cover border border-blue-300 flex-shrink-0 bg-white"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{scan.prediction}</h4>
                          <span className="text-[11px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded">
                            {(scan.confidence * 100).toFixed(1)}% AI Confidence
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Scanned: {new Date(scan.createdAt).toLocaleDateString()} at {new Date(scan.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <span className="inline-block mt-2 text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          Linked to Clinical Records
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Traditional Medical History Section + Add Form */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Diagnosed Conditions & Systemic History
              </h3>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!histCond.trim()) return;
                const { clinicalService } = await import("../services/clinical.service");
                await clinicalService.addMedicalHistory(patient._id, { condition: histCond, notes: histNotes, status: "active" });
                setHistCond("");
                setHistNotes("");
                window.location.reload();
              }}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 flex flex-col md:flex-row gap-2 text-xs"
            >
              <input
                type="text"
                placeholder="Condition (e.g. Asthma, Hypertension)..."
                value={histCond}
                onChange={(e) => setHistCond(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Notes / Precautions..."
                value={histNotes}
                onChange={(e) => setHistNotes(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Condition
              </button>
            </form>

            {(patient.medicalHistory || []).length === 0 ? (
              <p className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl border border-slate-100">
                No systemic medical history records logged.
              </p>
            ) : (
              <div className="space-y-3">
                {patient.medicalHistory.map((item) => (
                  <div key={item._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{item.condition}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-medium">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Diagnosed: {item.diagnosedAt ? new Date(item.diagnosedAt).toLocaleDateString() : "N/A"}
                    </p>
                    {Boolean(item.notes) && <p className="text-xs text-slate-700 mt-2">{item.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Medications */}
        {activeTab === "medications" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Active Medications</h2>

            {/* Add Medication Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!medName.trim()) return;
                const { clinicalService } = await import("../services/clinical.service");
                await clinicalService.addMedication(patient._id, { name: medName, dosage: medDosage, frequency: medFreq });
                setMedName("");
                setMedDosage("");
                setMedFreq("");
                window.location.reload();
              }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <input
                type="text"
                placeholder="Medication Name (e.g. Albuterol)..."
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Dosage (e.g. 90mcg)..."
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Frequency (e.g. As needed)..."
                value={medFreq}
                onChange={(e) => setMedFreq(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Plus className="h-4 w-4" /> Add Medication
              </button>
            </form>

            <div className="space-y-3 mb-6">
              {(patient.medications || []).map((med) => (
                <div key={med._id} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{med.name}</h4>
                    <p className="text-xs text-slate-600">Dosage: {med.dosage || "N/A"} • Frequency: {med.frequency || "N/A"}</p>
                    {Boolean(med.notes) && <p className="text-xs text-slate-500 mt-1">{med.notes}</p>}
                  </div>
                  <Pill className="h-5 w-5 text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Allergies */}
        {activeTab === "allergies" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Allergies & Sensitivities</h2>

            {/* Add Allergy Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!algName.trim()) return;
                const { clinicalService } = await import("../services/clinical.service");
                await clinicalService.addAllergy(patient._id, { allergen: algName, reaction: algReaction, severity: algSeverity });
                setAlgName("");
                setAlgReaction("");
                window.location.reload();
              }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <input
                type="text"
                placeholder="Allergen (e.g. Penicillin, Latex)..."
                value={algName}
                onChange={(e) => setAlgName(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Reaction (e.g. Rash, Hives)..."
                value={algReaction}
                onChange={(e) => setAlgReaction(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={algSeverity}
                onChange={(e) => setAlgSeverity(e.target.value as "mild" | "moderate" | "severe")}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe (Pre-Op Alert)</option>
              </select>
              <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Plus className="h-4 w-4" /> Add Allergy
              </button>
            </form>

            <div className="space-y-3 mb-6">
              {(patient.allergies || []).map((alg) => (
                <div
                  key={alg._id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    alg.severity === "severe"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : alg.severity === "moderate"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{alg.allergen}</h4>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-white/80">
                        {alg.severity}
                      </span>
                    </div>
                    <p className="text-xs mt-1">Reaction: {alg.reaction || "N/A"}</p>
                    {Boolean(alg.notes) && <p className="text-xs mt-1 opacity-80">{alg.notes}</p>}
                  </div>
                  <ShieldAlert className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Dental Chart (Mini Odontogram) */}
        {activeTab === "chart" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Patient FDI Dental Chart Overview</h2>
              <Link
                to={`/patients/${patient._id}/odontogram`}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                Launch Interactive Odontogram <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Stored Tooth Records (Per-tooth IDs)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {(patient.teeth || []).map((t) => (
                  <div
                    key={t._id || t.toothId}
                    onClick={() => navigate(`/patients/${patient._id}/odontogram`)}
                    className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                      t.state?.attention
                        ? "bg-amber-100 border-amber-300 text-amber-900 shadow-sm"
                        : "bg-white border-slate-200 text-slate-800 hover:border-blue-400"
                    }`}
                  >
                    <div className="font-extrabold text-base">Tooth {t.toothId}</div>
                    <div className="text-[11px] font-semibold mt-1">
                      {t.state?.condition === "caries"
                        ? "Caries / decayed tooth"
                        : t.state?.condition === "missing"
                        ? "Missing tooth"
                        : t.state?.restoration === "crown"
                        ? "Crowned tooth"
                        : t.state?.restoration !== "none"
                        ? "Filled tooth"
                        : t.state?.condition || "Healthy tooth"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Treatment History */}
        {activeTab === "treatments" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Clinical Event & Treatment History</h2>

            {/* Log Procedure Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!evtTitle.trim()) return;
                const { clinicalService } = await import("../services/clinical.service");
                await clinicalService.addPatientEvent(patient._id, {
                  title: evtTitle,
                  toothId: evtToothId || null,
                  type: evtType,
                  description: evtDesc,
                  date: new Date().toISOString(),
                });
                setEvtTitle("");
                setEvtDesc("");
                window.location.reload();
              }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <input
                type="text"
                placeholder="Procedure Title (e.g. Composite Restoration)..."
                value={evtTitle}
                onChange={(e) => setEvtTitle(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Tooth ID (e.g. 36)..."
                value={evtToothId}
                onChange={(e) => setEvtToothId(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <select
                value={evtType}
                onChange={(e) => setEvtType(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="procedure">Procedure</option>
                <option value="treatment">Treatment</option>
                <option value="diagnosis">Diagnosis</option>
              </select>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Plus className="h-4 w-4" /> Log Procedure
              </button>
            </form>

            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  onClick={() => navigate(`/patients/${patient._id}/odontogram`)}
                  className="p-4 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{ev.title}</h4>
                      {Boolean(ev.toothId) && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">
                          Tooth {ev.toothId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(ev.date).toLocaleDateString()} • Type: {ev.type}
                    </p>
                    {Boolean(ev.description) && <p className="text-sm text-slate-700 mt-2">{ev.description}</p>}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Patient Scoped Clinical Notes</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Notes marked with <span className="text-cyan-700 font-bold">Vector DB Indexed</span> are embedded into the RAG Chat knowledge base.
                </p>
              </div>
            </div>

            {/* Note Creation Form with Quick Presets & Vector DB Toggle */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newNoteText.trim() || !patient) return;
                const { clinicalService } = await import("../services/clinical.service");
                await clinicalService.addPatientNote(patient._id, newNoteText, "diagnosis", true);
                setNewNoteText("");
                window.location.reload();
              }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 space-y-3"
            >
              {/* Quick Clinical Note Presets */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  Quick Presets:
                </span>
                <button
                  type="button"
                  onClick={() => setNewNoteText("Tooth 36: Class I Occlusal Composite Resin Restoration completed successfully.")}
                  className="text-[11px] bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-2.5 py-1 rounded-md transition-colors"
                >
                  + Tooth 36 Composite
                </button>
                <button
                  type="button"
                  onClick={() => setNewNoteText("Periodontal prophylaxis completed; applied 5% NaF Fluoride varnish on lower molars.")}
                  className="text-[11px] bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-2.5 py-1 rounded-md transition-colors"
                >
                  + Prophylaxis & Varnish
                </button>
                <button
                  type="button"
                  onClick={() => setNewNoteText("Asthma pre-op check: Patient inhaler present and confirmed OK prior to procedure.")}
                  className="text-[11px] bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-2.5 py-1 rounded-md transition-colors"
                >
                  + Pre-Op Asthma Check
                </button>
              </div>
              <textarea
                placeholder="Enter clinical observations, diagnosis, or tooth history..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-900 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200">
                  <Sparkles className="h-4 w-4 text-cyan-600 animate-pulse" />
                  Auto-Index into Vector DB for RAG Assistant
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add & Index Note
                </button>
              </div>
            </form>

            {/* Notes List with Vector DB Badges */}
            <div className="space-y-3">
              {(patient.notes || []).map((n) => (
                <div key={n._id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Category: {n.category || "General"}
                    </span>
                    <span className="text-[11px] font-extrabold bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded border border-cyan-300 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-cyan-600" /> Vector DB Indexed [{n.vectorDbId || `vec_${n._id?.slice(-6)}`}]
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">{n.text}</p>
                  <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Just now"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Attachments */}
        {activeTab === "attachments" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Patient Attachments & Intraoral Scans</h2>

            {/* Upload PDF / Document / Photo Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const fileInput = document.getElementById("patientFileInput") as HTMLInputElement;
                const tagSelect = document.getElementById("patientFileTag") as HTMLSelectElement;
                if (!fileInput?.files?.[0]) return;
                const { clinicalService } = await import("../services/clinical.service");
                await clinicalService.uploadAttachment(patient._id, fileInput.files[0], tagSelect?.value || "pdf-reference");
                window.location.reload();
              }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 flex flex-col sm:flex-row items-center gap-3 text-xs"
            >
              <input
                id="patientFileInput"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                required
                className="flex-1 text-xs border border-slate-300 rounded-lg p-2 bg-white"
              />
              <select
                id="patientFileTag"
                className="border border-slate-300 rounded-lg p-2 bg-white text-xs font-semibold focus:outline-none"
              >
                <option value="pdf-reference">📄 PDF Medical Book / Reference</option>
                <option value="patient-record">📋 Patient Health Record PDF</option>
                <option value="intraoral-scan">📷 Intraoral Photo Scan</option>
                <option value="guidelines">⚕️ Clinical Guidelines</option>
              </select>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap">
                <Paperclip className="h-4 w-4" /> Upload Document / PDF
              </button>
            </form>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(patient.attachments || []).map((att) => {
                const isPdf = att.fileName.toLowerCase().endsWith(".pdf") || att.tag.includes("pdf");
                return (
                  <div key={att._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col justify-between">
                    <div>
                      {isPdf ? (
                        <FileText className="h-8 w-8 text-rose-600 mx-auto mb-2" />
                      ) : (
                        <Paperclip className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      )}
                      <div className="font-semibold text-xs text-slate-900 truncate" title={att.fileName}>{att.fileName}</div>
                      <span className="text-[10px] text-slate-400 block mt-1 uppercase font-mono">{att.tag}</span>
                    </div>
                    {isPdf && (
                      <span className="mt-2 text-[9px] font-extrabold bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded border border-cyan-300 block">
                        📄 Ingested for RAG Chat
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 9: AI Case Analysis */}
        {activeTab === "ai" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                AI Reports & Evidence Assembly
              </h2>
              <button
                onClick={() =>
                  analyzeToothMutation.mutate({ patientId: patient._id, toothId: "36" })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Request Tooth 36 AI Analysis
              </button>
            </div>
            <div className="space-y-4">
              {reports.map((rep) => (
                <div key={rep._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm">
                      Scope: {rep.scope} {rep.toothId ? `(Tooth ${rep.toothId})` : ""}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">
                    Context Snapshot Assembled: {Object.keys(rep.contextSnapshot || {}).length} Fields
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "research" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">External Research & PubMed Evidence</h2>

            {/* Add Research Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!resTitle.trim()) return;
                const { clinicalService } = await import("../services/clinical.service");
                await clinicalService.addResearch(patient._id, {
                  title: resTitle,
                  url: resUrl || "https://pubmed.ncbi.nlm.nih.gov/",
                  summary: resSummary,
                  source: "PubMed",
                });
                setResTitle("");
                setResUrl("");
                setResSummary("");
                window.location.reload();
              }}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs"
            >
              <input
                type="text"
                placeholder="Title (e.g. Lower Molar Restoration Guidelines)..."
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="PubMed / Article URL..."
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Summary / Guidelines..."
                value={resSummary}
                onChange={(e) => setResSummary(e.target.value)}
                className="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                <Plus className="h-4 w-4" /> Add Evidence Link
              </button>
            </form>

            <div className="space-y-3">
              {(patient.research || []).map((res) => (
                <div key={res._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{res.title}</h4>
                    {Boolean(res.url) && (
                      <a href={res.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        PubMed <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {Boolean(res.summary) && <p className="text-xs text-slate-600 mt-2">{res.summary}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Tab 11: Unified Chronological Timeline */}
        {activeTab === "timeline" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Unified Chronological Stream
            </h2>
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    EV
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ev.date).toLocaleDateString()}
                      </span>
                    </div>
                    {Boolean(ev.description) && (
                      <p className="text-xs text-slate-600 mt-1">{ev.description}</p>
                    )}
                  </div>
                </div>
              ))}
              {(patient.notes || []).map((n) => (
                <div key={n._id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    NT
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">Doctor Note [{n.category || "General"}]</h4>
                      <span className="text-[11px] text-slate-400">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{n.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
