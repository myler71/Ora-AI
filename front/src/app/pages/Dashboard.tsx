import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  useCreateDoctorNoteMutation,
  useDashboardQuery,
  useDeleteDoctorNoteMutation,
  useInventoryQuery,
  useUpdateAIReportStatusMutation,
} from "../queries/clinical.query";
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  BookOpen,
  Package,
  Plus,
  Trash2,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useDashboardQuery();
  const { data: inventoryData } = useInventoryQuery();
  const updateReportStatusMutation = useUpdateAIReportStatusMutation();
  const createDoctorNoteMutation = useCreateDoctorNoteMutation();
  const deleteDoctorNoteMutation = useDeleteDoctorNoteMutation();

  const [newNoteText, setNewNoteText] = useState("");
  const [pinnedNote, setPinnedNote] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    createDoctorNoteMutation.mutate(
      { text: newNoteText, pinned: pinnedNote },
      {
        onSuccess: () => {
          setNewNoteText("");
          setPinnedNote(false);
        },
      },
    );
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const {
    todaysAppointments = [],
    attentionCases = [],
    pendingAIReports = [],
    awaitingReviewAIReports = [],
    recentPatients = [],
    researchLinks = [],
    doctorNotes = [],
    totalPatients = 0,
  } = dashboard || {};

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Doctor Command Center
          </h1>
          <p className="text-slate-500 mt-1">
            Clinical Overview • {totalPatients} Active Patients • {todaysAppointments.length} Appointments Today
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Patient Workspace
          </Link>
        </div>
      </div>

      {/* 8-Card Command Center Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Today's Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Today's Appointments
              </h2>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {todaysAppointments.length} Total
              </span>
            </div>
            {todaysAppointments.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No appointments scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todaysAppointments.map((apt) => {
                  const patientObj = typeof apt.patient === "object" ? apt.patient : null;
                  const patientName = patientObj ? `${patientObj.firstName} ${patientObj.lastName}` : "Patient";
                  const patientId = patientObj ? patientObj._id : apt.patient;

                  return (
                    <div
                      key={apt._id}
                      onClick={() => navigate(`/patients/${patientId}`)}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-lg cursor-pointer transition-colors border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{patientName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {apt.type}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          apt.status === "checked-in"
                            ? "bg-green-100 text-green-800"
                            : apt.status === "completed"
                            ? "bg-slate-200 text-slate-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Link to="/calendar" className="text-xs font-medium text-blue-600 hover:text-blue-800 mt-4 flex items-center gap-1">
            View full calendar <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 2: Cases Requiring Attention */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Attention Cases
              </h2>
              <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {attentionCases.length} Flags
              </span>
            </div>
            {attentionCases.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No high-risk attention flags.</p>
            ) : (
              <div className="space-y-3">
                {attentionCases.map((p) => {
                  const attentionTeeth = p.teeth.filter((t) => t.state?.attention);
                  return (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/patients/${p._id}/odontogram`)}
                      className="p-3 bg-amber-50/50 hover:bg-amber-100/50 rounded-lg cursor-pointer transition-colors border border-amber-200/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 text-sm">
                          {p.firstName} {p.lastName}
                        </div>
                        <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                          {attentionTeeth.length} Tooth Flags
                        </span>
                      </div>
                      <div className="text-xs text-amber-900 mt-1">
                        Teeth: {attentionTeeth.map((t) => `Tooth ${t.toothId}`).join(", ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Link to="/patients" className="text-xs font-medium text-amber-700 hover:text-amber-900 mt-4 flex items-center gap-1">
            Review patient directory <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 3: Pending AI Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Pending AI Reports
              </h2>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {pendingAIReports.length} Queue
              </span>
            </div>
            {pendingAIReports.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No reports in pending state.</p>
            ) : (
              <div className="space-y-3">
                {pendingAIReports.map((rep) => {
                  const pName = typeof rep.patient === "object" ? `${rep.patient.firstName} ${rep.patient.lastName}` : "Patient";
                  return (
                    <div key={rep._id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="font-medium text-slate-900 text-sm">{pName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Scope: {rep.scope} {rep.toothId ? `(Tooth ${rep.toothId})` : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Card 4: AI Recommendations Awaiting Review */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Recommendations Awaiting Review
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {awaitingReviewAIReports.length} Awaiting Doctor Action
            </span>
          </div>

          {awaitingReviewAIReports.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No AI recommendations pending doctor review.</p>
          ) : (
            <div className="space-y-4">
              {awaitingReviewAIReports.map((rep) => {
                const pName = typeof rep.patient === "object" ? `${rep.patient.firstName} ${rep.patient.lastName}` : "Patient";
                const mockRes = rep.result || {};
                return (
                  <div key={rep._id} className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {pName}
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-normal">
                            Tooth {rep.toothId || "36"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1 font-medium">
                          {String(mockRes.mockDiagnosis || "Tooth fissure caries suspicion")}
                        </p>
                        {Boolean(mockRes.recommendedProcedure) && (
                          <p className="text-xs text-slate-500 mt-1">
                            Recommended: {String(mockRes.recommendedProcedure)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateReportStatusMutation.mutate({ id: rep._id, status: "reviewed" })
                          }
                          className="inline-flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() =>
                            updateReportStatusMutation.mutate({ id: rep._id, status: "rejected" })
                          }
                          className="inline-flex items-center gap-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card 5: Recent Cases */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-slate-600" />
              Recent Patients
            </h2>
          </div>
          <div className="space-y-2">
            {recentPatients.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/patients/${p._id}`)}
                className="p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-slate-100"
              >
                <div>
                  <div className="font-medium text-slate-900 text-sm">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{p.phone || p.email || "No contact"}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 6: Research & Evidence Shortcuts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Research & Evidence
            </h2>
          </div>
          {researchLinks.length === 0 ? (
            <div className="text-xs text-slate-500 space-y-2">
              <p>No active evidence links attached.</p>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=dental+caries+composite"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline block font-medium"
              >
                🔍 Search PubMed for Dental Guidelines
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {researchLinks.map((r, i) => (
                <div key={i} className="text-xs border-b border-slate-100 pb-2 last:border-0">
                  <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline block">
                    {r.title}
                  </a>
                  <span className="text-slate-400 font-medium">{r.patientName || "General"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 7: Inventory & Supply Alerts (Mock) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-rose-500" />
              Inventory Alerts
            </h2>
            <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-0.5 rounded">
              TODO Mock
            </span>
          </div>
          <div className="space-y-2">
            {(inventoryData?.inventory || []).map((inv) => (
              <div
                key={inv.id}
                className={`p-2.5 rounded-lg flex items-center justify-between text-xs ${
                  inv.isLow ? "bg-rose-50 border border-rose-100 text-rose-900" : "bg-slate-50 text-slate-700"
                }`}
              >
                <div>
                  <div className="font-semibold">{inv.item}</div>
                  <div className="text-[11px] text-slate-500">Qty: {inv.quantity} (Min: {inv.threshold})</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    inv.isLow ? "bg-rose-200 text-rose-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 8: Doctor Notes Scratchpad */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-700" />
              Doctor Scratchpad Notes
            </h2>
          </div>

          <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Quick clinical reminder or note..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={pinnedNote}
                onChange={(e) => setPinnedNote(e.target.checked)}
                className="rounded text-blue-600"
              />
              Pin
            </label>
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add Note
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doctorNotes.map((note) => (
              <div
                key={note._id}
                className={`p-3 rounded-lg border text-sm flex items-start justify-between ${
                  note.pinned ? "bg-amber-50/60 border-amber-200" : "bg-slate-50 border-slate-100"
                }`}
              >
                <div>
                  <p className="text-slate-800">{note.text}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => deleteDoctorNoteMutation.mutate(note._id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
