import { useState } from "react";
import { useNavigate } from "react-router";
import {
  useAppointmentsQuery,
  useCreateAppointmentMutation,
  usePatientsQuery,
  useUpdateAppointmentMutation,
} from "../queries/clinical.query";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ArrowRight,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(19); // 19th August
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [aptTime, setAptTime] = useState("10:00");
  const [aptType, setAptType] = useState("Consultation");
  const [aptReason, setAptReason] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const fromStr = new Date(year, month, 1).toISOString();
  const toStr = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const { data: appointmentsData } = useAppointmentsQuery(fromStr, toStr);
  const { data: patientsData } = usePatientsQuery();

  const createAppointmentMutation = useCreateAppointmentMutation();
  const updateAppointmentMutation = useUpdateAppointmentMutation();

  const appointments = appointmentsData?.appointments || [];
  const patients = patientsData?.patients || [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDay) return;

    const [hours, minutes] = aptTime.split(":").map((n) => parseInt(n, 10));
    const dateTime = new Date(year, month, selectedDay, hours || 10, minutes || 0);

    createAppointmentMutation.mutate(
      {
        patientId: selectedPatientId,
        dateTime: dateTime.toISOString(),
        type: aptType,
        reason: aptReason,
        status: "scheduled",
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          setAptReason("");
        },
      },
    );
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (typeFilter !== "all" && apt.type !== typeFilter) return false;
    return true;
  });

  const selectedDateAppointments = filteredAppointments.filter((apt) => {
    if (!selectedDay) return false;
    const d = new Date(apt.dateTime);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            Clinical Calendar & Appointment Scheduler
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Interactive Doctor Scheduling • Real-time Status Sync
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGoToday}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Today
          </button>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-0 focus:outline-none text-slate-700 font-semibold cursor-pointer"
            >
              <option value="all">All Appointment Types</option>
              <option value="Consultation">Consultation</option>
              <option value="AI Tooth Analysis & Clean">AI Tooth Analysis & Clean</option>
              <option value="Periodontal Check">Periodontal Check</option>
              <option value="Routine Checkup">Routine Checkup</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" /> Schedule Appointment
          </button>

          {/* Month Nav Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <span className="font-bold text-slate-900 text-sm min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Month Grid */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase mb-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank padding days before 1st of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20 bg-slate-50/50 rounded-xl border border-transparent"></div>
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = selectedDay === dayNum;
              const dayApts = filteredAppointments.filter((apt) => {
                const d = new Date(apt.dateTime);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
              });

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-20 p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "ring-2 ring-blue-600 bg-blue-50/80 border-blue-400 font-bold shadow-md"
                      : dayApts.length > 0
                      ? "bg-white border-blue-200 hover:border-blue-400"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                      {dayNum}
                    </span>
                    {dayApts.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>

                  {/* Badges / Dots */}
                  {dayApts.length > 0 && (
                    <div className="space-y-1">
                      {dayApts.slice(0, 2).map((apt) => (
                        <div
                          key={apt._id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-semibold"
                        >
                          {apt.type}
                        </div>
                      ))}
                      {dayApts.length > 2 && (
                        <span className="text-[9px] font-bold text-blue-600 block text-right">
                          +{dayApts.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Side Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-lg">
                Agenda for {monthNames[month]} {selectedDay}, {year}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                + Add
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              {selectedDateAppointments.length} Scheduled Events
            </p>

            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No appointments scheduled for this day.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Schedule Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateAppointments.map((apt) => {
                  const patObj = typeof apt.patient === "object" ? apt.patient : null;
                  const pName = patObj ? `${patObj.firstName} ${patObj.lastName}` : "Patient";
                  const pId = patObj ? patObj._id : apt.patient;

                  return (
                    <div
                      key={apt._id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div
                            onClick={() => navigate(`/patients/${pId}`)}
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
                          >
                            <User className="h-4 w-4 text-blue-600" /> {pName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {apt.type}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            apt.status === "checked-in"
                              ? "bg-green-100 text-green-800"
                              : apt.status === "completed"
                              ? "bg-slate-200 text-slate-800"
                              : apt.status === "cancelled"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      {Boolean(apt.reason) && <p className="text-xs text-slate-600">Reason: {apt.reason}</p>}

                      {/* Instant Status Quick Toggle */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateAppointmentMutation.mutate({ id: apt._id, payload: { status: "checked-in" } })}
                            className="text-[10px] bg-white border border-slate-200 hover:bg-green-50 hover:text-green-700 px-2 py-0.5 rounded font-semibold text-slate-600"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => updateAppointmentMutation.mutate({ id: apt._id, payload: { status: "completed" } })}
                            className="text-[10px] bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 px-2 py-0.5 rounded font-semibold text-slate-600"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateAppointmentMutation.mutate({ id: apt._id, payload: { status: "cancelled" } })}
                            className="text-[10px] bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded font-semibold text-slate-600"
                          >
                            Cancel
                          </button>
                        </div>
                        <button
                          onClick={() => navigate(`/patients/${pId}`)}
                          className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                        >
                          Workspace <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Schedule Appointment</h2>
            <p className="text-xs text-slate-500 mb-4">
              Date: {monthNames[month]} {selectedDay}, {year}
            </p>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={aptType}
                    onChange={(e) => setAptType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="AI Tooth Analysis & Clean">AI Tooth Analysis & Clean</option>
                    <option value="Periodontal Check">Periodontal Check</option>
                    <option value="Routine Checkup">Routine Checkup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Tooth 36 follow-up examination"
                  value={aptReason}
                  onChange={(e) => setAptReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAppointmentMutation.isPending}
                  className="px-4 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {createAppointmentMutation.isPending ? "Scheduling..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
