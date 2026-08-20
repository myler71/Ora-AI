import { useState } from "react";
import {
  useChatMessagesQuery,
  useChatSessionsQuery,
  useCreateChatSessionMutation,
  usePatientsQuery,
  useSendChatMessageMutation,
} from "../queries/clinical.query";
import { aiServiceStub } from "../../lib/services/ai";
import {
  MessageSquare,
  Plus,
  Send,
  FileText,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Paperclip,
  X,
  CheckCircle2,
  Cpu,
} from "lucide-react";

export default function ChatbotPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // Session Creation Dialog State
  const [newChatPatientId, setNewChatPatientId] = useState<string>("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Report Builder State
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [templateType, setTemplateType] = useState<"tooth-analysis" | "patient-summary" | "treatment-plan">("patient-summary");
  const [reportTitle, setReportTitle] = useState("");
  const [reportPreview, setReportPreview] = useState<string | null>(null);

  const { data: sessionsData, isLoading: sessionsLoading } = useChatSessionsQuery();
  const { data: patientsData } = usePatientsQuery();

  const sessions = sessionsData?.sessions || [];
  const patients = patientsData?.patients || [];

  const activeSessionId = selectedSessionId || (sessions.length > 0 ? sessions[0]._id : "");
  const activeSession = sessions.find((s) => s._id === activeSessionId);
  const boundPatient = patients.find((p) => p._id === activeSession?.patient);

  const { data: messagesData } = useChatMessagesQuery(activeSessionId, Boolean(activeSessionId));
  const messages = messagesData?.messages || [];

  const createSessionMutation = useCreateChatSessionMutation();
  const sendMessageMutation = useSendChatMessageMutation();

  const handleCreateSession = (patientId?: string) => {
    const pat = patients.find((p) => p._id === patientId);
    const title = pat
      ? `Case Discussion — ${pat.firstName} ${pat.lastName}`
      : `General Clinical Discussion ${sessions.length + 1}`;

    createSessionMutation.mutate(
      { title, patientId: patientId || undefined },
      {
        onSuccess: (res) => {
          if (res?.session?._id) {
            setSelectedSessionId(res.session._id);
            setIsNewChatModalOpen(false);
          }
        },
      },
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFileName(e.target.files[0].name);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachedFileName) return;

    let fullMessage = inputMessage.trim();
    if (attachedFileName) {
      fullMessage = fullMessage
        ? `${fullMessage} [Attached Document: ${attachedFileName}]`
        : `[Attached Document: ${attachedFileName}]`;
    }

    if (!activeSessionId) {
      createSessionMutation.mutate(
        { title: "Clinical Discussion" },
        {
          onSuccess: (res) => {
            if (res?.session?._id) {
              setSelectedSessionId(res.session._id);
              sendMessageMutation.mutate({ sessionId: res.session._id, text: fullMessage });
              setInputMessage("");
              setAttachedFileName(null);
            }
          },
        },
      );
    } else {
      sendMessageMutation.mutate({ sessionId: activeSessionId, text: fullMessage });
      setInputMessage("");
      setAttachedFileName(null);
    }
  };

  const handleGenerateReportPreview = () => {
    if (!selectedPatientId) return;
    const pat = patients.find((p) => p._id === selectedPatientId);
    const pName = pat ? `${pat.firstName} ${pat.lastName}` : "Selected Patient";

    const res = aiServiceStub.generateReportPreview(
      {
        patientId: selectedPatientId,
        templateType,
        title: reportTitle || undefined,
      },
      pName,
    );

    setReportPreview(res.markdownContent);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-7xl">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-slate-200 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bot className="h-7 w-7 text-blue-600" />
          Clinical Assistant & RAG Intelligence Engine
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-0.5">
          Live Multi-Agent Dental AI • Semantic Vector RAG Retrieval • Real-time Report Builder
        </p>
      </div>

      {/* 3-Column Scroll-Locked Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-175px)] min-h-[580px]">
        {/* Left Column: Chat Sessions */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between h-full min-h-0 overflow-hidden shadow-xs">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" /> Chat Sessions
              </h3>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                title="New Chat Session"
              >
                <Plus className="h-4 w-4" /> New
              </button>
            </div>

            {sessionsLoading ? (
              <p className="text-xs text-slate-400">Loading chats...</p>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No chat sessions yet. Click + New to start.</p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0 pr-1">
                {sessions.map((s) => {
                  const isActive = s._id === activeSessionId;
                  return (
                    <div
                      key={s._id}
                      onClick={() => setSelectedSessionId(s._id)}
                      className={`p-3 rounded-xl cursor-pointer text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="truncate">{s.title}</div>
                      {Boolean(s.patient) && (
                        <span className={`text-[9px] block mt-0.5 ${isActive ? "text-blue-100" : "text-blue-600"}`}>
                          Patient Context Linked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Message Thread & Input (Scroll-locked) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between h-full min-h-0 overflow-hidden shadow-xs">
          {/* Thread Header */}
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Clinical Intelligence Assistant
                {boundPatient && (
                  <span className="text-xs font-normal text-slate-500">
                    ({boundPatient.firstName} {boundPatient.lastName})
                  </span>
                )}
              </h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
              <Cpu className="h-3 w-3 text-emerald-700 animate-pulse" /> LIVE RAG ENGINE (GROQ LLM)
            </span>
          </div>

          {/* Messages Feed (Scrollable without expanding parent) */}
          <div className="flex-1 min-h-0 overflow-y-auto my-3 space-y-3.5 pr-2">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Bot className="h-10 w-10 mx-auto mb-2 text-blue-600 opacity-60" />
                Ask clinical questions, explore dental disease guidelines, or cross-check patient allergy risks.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m._id}
                  className={`flex gap-3 text-xs ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.sender === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none shadow-xs"
                        : "bg-slate-50 text-slate-900 rounded-tl-none border border-slate-200/80 shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                  </div>
                  {m.sender === "user" && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Bottom Area: Controls & Input Form (Fixed to bottom) */}
          <div className="flex-shrink-0 space-y-2 pt-2 border-t border-slate-100">
            {/* Context Pills & Clickable Suggested Prompts */}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-600" />
                Knowledge Base: ADA Guidelines & PubMed 2025
              </span>
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Vector DB: Active
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setInputMessage("Explain clinical protocol for Tooth 36 occlusal fissure caries under rubber dam isolation.")}
                className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-2 py-1 rounded-md transition-colors"
              >
                💡 Tooth 36 Caries Protocol
              </button>
              <button
                type="button"
                onClick={() => setInputMessage("What restorative material is recommended for a Class I molar cavity with high occlusal load?")}
                className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-2 py-1 rounded-md transition-colors"
              >
                💡 Molar Material Selection
              </button>
            </div>

            {/* Attached File Preview Chip */}
            {attachedFileName && (
              <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5 truncate">
                  <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                  Attached: {attachedFileName}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedFileName(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                id="hiddenChatFileInput"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("hiddenChatFileInput")?.click()}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 rounded-xl transition-colors"
                title="Attach PDF, Document, or Intraoral Scan"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                placeholder="Ask Dental AI assistant or discuss clinical case..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={sendMessageMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-1.5 text-xs"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Report Builder Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between h-full min-h-0 overflow-y-auto shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" /> Report Builder
              </h3>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                Live Generator
              </span>
            </div>

            {/* PDF Reference Corpus & Template Controls */}
            <div className="space-y-3 text-xs mb-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">📄 PDF Reference Corpus</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">RAG Active</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ADA Restorative Guidelines & PubMed dental knowledge base indexed for automated evidence assembly.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Pick Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {Boolean(selectedPatientId) && (
                <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1">
                  <div className="font-bold text-cyan-900 flex items-center gap-1.5 text-xs">
                    <Sparkles className="h-4 w-4 text-cyan-600 animate-pulse" /> Vector DB Context Loaded
                  </div>
                  <p className="text-[11px] text-cyan-800">
                    Patient notes, tooth history & intraoral scans are vector-indexed for semantic search & report generation.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Report Template</label>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value as "tooth-analysis" | "patient-summary" | "treatment-plan")}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="tooth-analysis">Tooth 36 AI Analysis Report</option>
                  <option value="patient-summary">Full Patient Clinical Summary</option>
                  <option value="treatment-plan">Restorative Treatment Plan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Tooth 36 Caries & Restoration Summary"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleGenerateReportPreview}
                disabled={!selectedPatientId}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> Generate Clinical Report Draft
              </button>
            </div>

            {/* Generated Report Preview Area */}
            {reportPreview && (
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-3 font-mono border border-slate-800 relative">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 pb-2 border-b border-slate-800">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> CLINICAL REPORT DRAFT
                  </span>
                  <span>Markdown Preview</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto">
                  {reportPreview}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Session Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Start New Clinical Session</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Patient Context (Optional)
              </label>
              <select
                value={newChatPatientId}
                onChange={(e) => setNewChatPatientId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">General Clinical Discussion (No Patient)</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateSession(newChatPatientId || undefined)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
