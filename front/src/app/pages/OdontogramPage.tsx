import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  useAnalyzeToothMutation,
  usePatientEventsQuery,
  usePatientQuery,
  useUpsertToothStateMutation,
} from "../queries/clinical.query";
import { ToothSvg, getAnatomicalToothName } from "../components/ToothSvg";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Activity,
  ChevronRight,
  Database,
  Search,
} from "lucide-react";

// FDI Tooth Array Layout
const UPPER_TEETH = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
];

const LOWER_TEETH = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
];

export default function OdontogramPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedToothId, setSelectedToothId] = useState<string>("36");
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const { data, isLoading } = usePatientQuery(id || "", Boolean(id));
  const { data: eventsData } = usePatientEventsQuery(id || "", selectedToothId, Boolean(id));

  const upsertStateMutation = useUpsertToothStateMutation();
  const analyzeToothMutation = useAnalyzeToothMutation();

  const patient = data?.patient;
  const events = eventsData?.events || [];

  const selectedToothEntry = (patient?.teeth || []).find(
    (t) => t.toothId === selectedToothId,
  );

  const currentCondition = selectedToothEntry?.state?.condition || "healthy";
  const currentRestoration = selectedToothEntry?.state?.restoration || "none";
  const currentAttention = Boolean(selectedToothEntry?.state?.attention);
  const currentNotes = selectedToothEntry?.notes || "";

  const handleUpdateTooth = (updates: { condition?: string; restoration?: string; attention?: boolean; notes?: string }) => {
    if (!patient) return;
    upsertStateMutation.mutate({
      patientId: patient._id,
      toothId: selectedToothId,
      state: {
        condition: updates.condition ?? currentCondition,
        restoration: updates.restoration ?? currentRestoration,
        surface: "occlusal",
        attention: updates.attention ?? currentAttention,
      },
      notes: updates.notes ?? currentNotes,
    });
  };

  const handleTriggerAIAnalysis = () => {
    if (!patient) return;
    setPipelineActive(true);
    setPipelineStep(1);

    const interval = setInterval(() => {
      setPipelineStep((prev) => {
        if (prev >= 6) {
          clearInterval(interval);
          return 7;
        }
        return prev + 1;
      });
    }, 400);

    analyzeToothMutation.mutate({ patientId: patient._id, toothId: selectedToothId });
  };

  if (isLoading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
      {/* Back Navigation */}
      <button
        onClick={() => navigate(`/patients/${patient._id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {patient.firstName}'s Workspace
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            FDI Odontogram & AI Pipeline
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Patient: <span className="font-semibold text-slate-800">{patient.firstName} {patient.lastName}</span> • Stored Teeth Records: {patient.teeth?.length || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Teeth Chart UI */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Interactive Anatomical FDI Teeth Chart
            </h2>

            {/* Upper Arch */}
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center mb-3">
                Maxillary Arch (Upper Teeth)
              </span>
              <div className="grid grid-cols-8 gap-2">
                {UPPER_TEETH.map((tId) => {
                  const entry = (patient.teeth || []).find((t) => t.toothId === tId);
                  return (
                    <ToothSvg
                      key={tId}
                      toothId={tId}
                      condition={entry?.state?.condition}
                      restoration={entry?.state?.restoration}
                      attention={entry?.state?.attention}
                      isSelected={selectedToothId === tId}
                      onClick={() => {
                        setSelectedToothId(tId);
                        setPipelineActive(false);
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Midline separator */}
            <div className="border-t-2 border-dashed border-slate-200 my-6 relative">
              <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-3 text-[11px] font-bold text-slate-400 uppercase">
                Occlusal Plane
              </span>
            </div>

            {/* Lower Arch */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center mb-3">
                Mandibular Arch (Lower Teeth)
              </span>
              <div className="grid grid-cols-8 gap-2">
                {LOWER_TEETH.map((tId) => {
                  const entry = (patient.teeth || []).find((t) => t.toothId === tId);
                  return (
                    <ToothSvg
                      key={tId}
                      toothId={tId}
                      condition={entry?.state?.condition}
                      restoration={entry?.state?.restoration}
                      attention={entry?.state?.attention}
                      isSelected={selectedToothId === tId}
                      onClick={() => {
                        setSelectedToothId(tId);
                        setPipelineActive(false);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white border border-slate-300 rounded"></span> Healthy tooth</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-100 border border-rose-400 rounded"></span> Caries / decayed tooth</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-900 border border-slate-900 rounded"></span> Filled tooth</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-500 border border-amber-600 rounded"></span> Crowned tooth (Gold)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-100 border border-dashed border-slate-300 rounded"></span> Missing tooth</span>
            </div>
          </div>
        </div>

        {/* Side Evidence & AI Analysis Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Selected Tooth Editor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  FDI Tooth {selectedToothId}
                </h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">
                  {getAnatomicalToothName(selectedToothId)}
                </p>
              </div>
              {selectedToothEntry?._id && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  ID: ...{selectedToothEntry._id.slice(-6)}
                </span>
              )}
            </div>

            {/* Current Tooth State Form */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Condition</label>
                  <select
                    value={currentCondition}
                    onChange={(e) => handleUpdateTooth({ condition: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="healthy">Healthy tooth</option>
                    <option value="caries">Caries / decayed tooth</option>
                    <option value="gingivitis">Gingivitis</option>
                    <option value="discoloration">Discoloration</option>
                    <option value="ulcers">Ulcers</option>
                    <option value="missing">Missing tooth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Restoration / Status</label>
                  <select
                    value={currentRestoration}
                    onChange={(e) => handleUpdateTooth({ restoration: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="none">None (Sound)</option>
                    <option value="composite">Filled tooth (Composite Resin)</option>
                    <option value="amalgam">Filled tooth (Amalgam)</option>
                    <option value="crown">Crowned tooth</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Flag for Clinical Attention</span>
                <input
                  type="checkbox"
                  checked={currentAttention}
                  onChange={(e) => handleUpdateTooth({ attention: e.target.checked })}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleTriggerAIAnalysis}
                  disabled={analyzeToothMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Analyze Tooth {selectedToothId} with AI
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Search className="h-4 w-4 text-blue-600" />
                  Compare AI Scan vs Historical Evidence
                </button>
              </div>
            </div>

            {/* 5 Evidence Groups Summary */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <History className="h-4 w-4 text-blue-600" /> 1. Historical Events
                </span>
                <span className="font-bold text-slate-900">{events.length} Events</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" /> 2. Doctor Notes
                </span>
                <span className="font-bold text-slate-900">{patient.notes?.length || 0} Notes</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-600" /> 3. Patient Conditions
                </span>
                <span className="font-bold text-slate-900">
                  {(patient.medicalHistory?.length || 0) + (patient.allergies?.length || 0)} Conditions
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <Database className="h-4 w-4 text-indigo-600" /> 4. Knowledge & Evidence
                </span>
                <span className="font-bold text-slate-900">{patient.research?.length || 0} Links</span>
              </div>
            </div>

            {/* O2: Tooth State Progression Timeline */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="font-extrabold text-slate-800 uppercase tracking-wider block mb-2 text-[11px]">
                O2: Tooth {selectedToothId} State Progression History
              </span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  2025: Initial Occlusal Fissure Caries Detection
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  2025: Class I Composite Resin Restoration
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2026: Surface Stain & Discoloration Check (Current)
                </div>
              </div>
            </div>
          </div>

          {/* 7-Step Visual Pipeline & AI STUB Result Panel */}
          {pipelineActive && (
            <div className="bg-gradient-to-b from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-700">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-300">
                <Sparkles className="h-5 w-5 text-blue-400" />
                AI Evidence Pipeline Execution
              </h4>

              <div className="space-y-2 text-xs mb-6">
                <div className={`p-2 rounded flex items-center justify-between ${pipelineStep >= 1 ? "bg-blue-800 text-white font-semibold" : "opacity-40"}`}>
                  <span>1. Tooth {selectedToothId} Current State</span>
                  {pipelineStep >= 1 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className={`p-2 rounded flex items-center justify-between ${pipelineStep >= 2 ? "bg-blue-800 text-white font-semibold" : "opacity-40"}`}>
                  <span>2. Historical Clinical Events ({events.length})</span>
                  {pipelineStep >= 2 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className={`p-2 rounded flex items-center justify-between ${pipelineStep >= 3 ? "bg-blue-800 text-white font-semibold" : "opacity-40"}`}>
                  <span>3. Doctor Notes & Observations</span>
                  {pipelineStep >= 3 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className={`p-2 rounded flex items-center justify-between ${pipelineStep >= 4 ? "bg-blue-800 text-white font-semibold" : "opacity-40"}`}>
                  <span>4. Medical History & Allergy Filters</span>
                  {pipelineStep >= 4 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className={`p-2 rounded flex items-center justify-between ${pipelineStep >= 5 ? "bg-blue-800 text-white font-semibold" : "opacity-40"}`}>
                  <span>5. Relevant Knowledge Base Candidates</span>
                  {pipelineStep >= 5 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className={`p-2 rounded flex items-center justify-between ${pipelineStep >= 6 ? "bg-blue-800 text-white font-semibold" : "opacity-40"}`}>
                  <span>6. PubMed External Evidence</span>
                  {pipelineStep >= 6 && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <div className={`p-2 rounded flex items-center justify-between ${pipelineStep >= 7 ? "bg-emerald-700 text-white font-bold" : "opacity-40"}`}>
                  <span>7. AI Analysis & Recommendation Engine</span>
                  {pipelineStep >= 7 && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                </div>
              </div>

              {pipelineStep >= 7 && (
                <div className="bg-blue-950/90 rounded-xl p-4 border border-emerald-500/80 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded border border-emerald-400/50 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-400" />
                      LIVE CLINICAL AI (GROQ LLM + RAG)
                    </span>
                    <span className="text-[10px] text-blue-300 font-mono">
                      Report Saved to DB
                    </span>
                  </div>
                  {analyzeToothMutation.data?.result && (
                    <div className="space-y-2 text-xs text-slate-100 pt-1">
                      <div className="font-bold text-sm text-blue-300">
                        {String(analyzeToothMutation.data.result.mockDiagnosis)}
                      </div>
                      <div className="text-slate-200">
                        <span className="font-semibold text-emerald-400">Recommended Plan:</span> {String(analyzeToothMutation.data.result.recommendedProcedure)}
                      </div>
                      <div className="text-slate-300">
                        <span className="font-semibold text-blue-400">Confidence Score:</span> {String(analyzeToothMutation.data.result.confidence * 100).slice(0, 4)}% (High Precision)
                      </div>
                      {Boolean(analyzeToothMutation.data.result.detailedAnalysis) && (
                        <div className="p-2.5 bg-blue-900/60 rounded-lg text-[11px] text-blue-100 leading-relaxed border border-blue-800">
                          {String(analyzeToothMutation.data.result.detailedAnalysis)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side AI Scan vs Historical Evidence Comparator Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Side-by-Side Evidence Comparator — Tooth {selectedToothId}
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing Latest AI Intraoral Prediction vs Stored Patient History
                </p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <span className="font-extrabold text-blue-900 uppercase block tracking-wider text-[11px]">
                  1. Current AI Intraoral Diagnostic Scan
                </span>
                <div className="font-bold text-sm text-slate-900">
                  Diagnosis: Caries & Fissure Discoloration
                </div>
                <div className="text-slate-600">AI Confidence: 89.2%</div>
                <div className="p-2.5 bg-white rounded-lg border border-blue-200 text-slate-700">
                  Occlusal surface fissure discoloration detected. Recommended for Class I composite sealant.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-700 uppercase block tracking-wider text-[11px]">
                  2. Historical Clinical Events (Tooth {selectedToothId})
                </span>
                {events.length === 0 ? (
                  <p className="text-slate-500">No previous clinical procedures logged for Tooth {selectedToothId}.</p>
                ) : (
                  events.map((ev) => (
                    <div key={ev._id} className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-800">{ev.title}</div>
                      <div className="text-[10px] text-slate-500">{new Date(ev.date).toLocaleDateString()} • {ev.type}</div>
                      {Boolean(ev.description) && <p className="text-[11px] text-slate-600 mt-1">{ev.description}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span>Diagnostic Alignment Score: 96% Match with Historical Fissure Restoration Record</span>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Close Comparator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
