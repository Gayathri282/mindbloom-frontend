'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '@/components/UserAvatar';
import { AvailabilitySlot, SessionType } from '@/lib/types';
import { parseSlotDateTime, isSlotExpired, getEffectiveAppointmentStatus } from '@/lib/slotUtils';
import {
  Video,
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  MessageSquare,
  ShieldAlert,
  Plus,
  Trash2,
  Save,
  Eye,
  Bell,
  Stethoscope,
  Pencil,
  Check,
  X,
  Award,
  Activity,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Zap,
  ChevronRight,
} from 'lucide-react';

interface DoctorPortalViewProps {
  setActiveTab: (tab: string) => void;
}

// Helpers for Calendar Date & Time Calculations
function getTodayIsoString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getTomorrowIsoString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatDayLabelFromDate(dateStr: string): string {
  if (!dateStr) return 'Upcoming';
  const today = getTodayIsoString();
  const tomorrow = getTomorrowIsoString();

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeRangeFromStart(start24: string, durationMins: number = 50): string {
  if (!start24) return '10:00 AM - 10:50 AM';
  const [hStr, mStr] = start24.split(':');
  let startHour = parseInt(hStr, 10);
  let startMin = parseInt(mStr, 10);

  const startAmPm = startHour >= 12 ? 'PM' : 'AM';
  const startDispHour = startHour % 12 === 0 ? 12 : startHour % 12;
  const startDispMin = startMin < 10 ? `0${startMin}` : `${startMin}`;

  let totalEndMins = startHour * 60 + startMin + durationMins;
  let endHour = Math.floor(totalEndMins / 60) % 24;
  let endMin = totalEndMins % 60;

  const endAmPm = endHour >= 12 ? 'PM' : 'AM';
  const endDispHour = endHour % 12 === 0 ? 12 : endHour % 12;
  const endDispMin = endMin < 10 ? `0${endMin}` : `${endMin}`;

  return `${startDispHour}:${startDispMin} ${startAmPm} - ${endDispHour}:${endDispMin} ${endAmPm}`;
}

export const DoctorPortalView: React.FC<DoctorPortalViewProps> = ({ setActiveTab }) => {
  const {
    user,
    appointments,
    slots,
    addSlot,
    removeSlot,
    startDoctorCall,
    notifyPatientAgain,
    therapistMessages,
    sendTherapistMessage,
    patientDocuments,
    sessionNotes,
    saveSessionNote,
    carePlan,
    saveTherapistCarePlan,
    crisisLogs,
    resolveCrisisLog,
    sendPrescription,
    sessionTypes,
    addSessionType,
    updateSessionType,
    deleteSessionType,
    toggleSessionType,
  } = useApp();

  const [activeDoctorTab, setActiveDoctorTab] = useState<
    'schedule' | 'patients' | 'slots' | 'session_types'
  >('schedule');

  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  const upcomingAppt = appointments.find((a) => {
    const status = getEffectiveAppointmentStatus(a);
    return status === 'scheduled' || status === 'in_progress';
  });
  const [currentNotes, setCurrentNotes] = useState<string>(
    sessionNotes[upcomingAppt?.id || ''] || ''
  );

  // ── Calendar & Time Slot Picker State ──
  const [slotDateInput, setSlotDateInput] = useState<string>(getTomorrowIsoString());
  const [slotTimeInput, setSlotTimeInput] = useState<string>('10:00');
  const [slotDurationMins, setSlotDurationMins] = useState<number>(50);

  // Inline Slot Editing State
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editDateInput, setEditDateInput] = useState<string>(getTomorrowIsoString());
  const [editTimeInput, setEditTimeInput] = useState<string>('14:00');
  const [editDurationMins, setEditDurationMins] = useState<number>(50);

  // Session type inputs
  const [newStDuration, setNewStDuration] = useState<number>(45);
  const [newStPrice, setNewStPrice] = useState<number>(10);
  const [newStLabel, setNewStLabel] = useState<string>('45-Minute Therapy Session');

  // Inline Session Type Editing State
  const [editingStId, setEditingStId] = useState<string | null>(null);
  const [editStLabel, setEditStLabel] = useState<string>('');
  const [editStDuration, setEditStDuration] = useState<number>(30);
  const [editStPrice, setEditStPrice] = useState<number>(500);

  const [replyText, setReplyText] = useState('');

  const mySessionTypes = sessionTypes.filter(
    (st) => st.counselor_id === user.id || (user.email && st.counselor_id === user.email)
  );

  const availableSessionTypes: SessionType[] = mySessionTypes;

  const mySlots = slots.filter(
    (s) => s.therapist_id === user.id || (user.email && s.therapist_email === user.email)
  );

  const unresolvedCrisisCount = crisisLogs.filter((l) => !l.resolved).length;

  const upcomingAppointments = appointments.filter((a) => {
    const status = getEffectiveAppointmentStatus(a);
    return status === 'scheduled' || status === 'in_progress';
  });

  const completedAppointments = appointments.filter((a) => {
    const status = getEffectiveAppointmentStatus(a);
    return status === 'completed';
  });

  const missedAppointments = appointments.filter((a) => {
    const status = getEffectiveAppointmentStatus(a);
    return status === 'missed';
  });

  const [apptFilterTab, setApptFilterTab] = useState<'upcoming' | 'completed' | 'missed'>('upcoming');

  const filteredDoctorAppts = appointments.filter((a) => {
    const status = getEffectiveAppointmentStatus(a);
    if (apptFilterTab === 'upcoming') return status === 'scheduled' || status === 'in_progress';
    if (apptFilterTab === 'completed') return status === 'completed';
    if (apptFilterTab === 'missed') return status === 'missed';
    return true;
  });

  const handleSaveNotes = () => {
    if (upcomingAppt) {
      saveSessionNote(upcomingAppt.id, currentNotes);
      alert(`Clinical session notes saved for ${upcomingAppt.patient_name}`);
    }
  };

  // Add single slot from Calendar Picker
  const handleAddSlotFromCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    const slotStartDateTime = parseSlotDateTime(slotDateInput, slotTimeInput);
    if (slotStartDateTime.getTime() < Date.now()) {
      alert('⚠️ Cannot publish an availability slot in the past! Please select a future date and start time.');
      return;
    }

    const dayLabel = formatDayLabelFromDate(slotDateInput);
    const timeLabel = formatTimeRangeFromStart(slotTimeInput, slotDurationMins);

    addSlot(dayLabel, timeLabel);
    alert(`Slot published for ${dayLabel} at ${timeLabel}`);
  };

  // Quick Batch Add Slots (e.g. Morning or Afternoon)
  const handleBatchAddSlots = (batchType: 'morning' | 'afternoon') => {
    const dayLabel = formatDayLabelFromDate(slotDateInput);
    const times = batchType === 'morning' ? ['09:00', '10:00', '11:00'] : ['14:00', '15:00', '16:00'];
    const futureTimes = times.filter((t) => parseSlotDateTime(slotDateInput, t).getTime() > Date.now());

    if (futureTimes.length === 0) {
      alert(`⚠️ All ${batchType} slots for ${dayLabel} are already in the past! Please select a future date.`);
      return;
    }

    futureTimes.forEach((t) => {
      const timeLabel = formatTimeRangeFromStart(t, slotDurationMins);
      addSlot(dayLabel, timeLabel);
    });

    alert(`Published ${futureTimes.length} ${batchType} availability slot(s) for ${dayLabel}!`);
  };

  const handleStartEdit = (slot: AvailabilitySlot) => {
    setEditingSlotId(slot.id);
    setEditDateInput(getTomorrowIsoString());
    setEditTimeInput('10:00');
    setEditDurationMins(50);
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
  };

  const handleSaveEdit = (slotId: string) => {
    const dayLabel = formatDayLabelFromDate(editDateInput);
    const timeLabel = formatTimeRangeFromStart(editTimeInput, editDurationMins);

    removeSlot(slotId);
    addSlot(dayLabel, timeLabel);
    setEditingSlotId(null);
  };

  const handleAddSessionType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStLabel.trim()) return;
    addSessionType(newStDuration, newStPrice, newStLabel);
    setNewStLabel('');
    alert('Session type added successfully!');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendTherapistMessage(replyText);
    setReplyText('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">

      {/* ── Doctor Header Banner ── */}
      <div className="relative bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden border border-white/10">
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} size="xl" />
              <span className="absolute -bottom-1 -right-1 bg-emerald-400 text-white text-xs p-1 rounded-full shadow">✓</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-200 text-[11px] font-bold rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" /> Verified Practitioner
                </span>
                {unresolvedCrisisCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-rose-500/30 text-rose-100 text-[11px] font-bold rounded-full border border-rose-400/40 flex items-center gap-1 animate-bounce">
                    <ShieldAlert className="w-3 h-3" /> {unresolvedCrisisCount} Crisis Alert
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold">{user.full_name}</h2>
              <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                {user.credentials || 'Clinical Psychologist'} • {user.specialties?.join(', ') || 'Cognitive Behavioral Therapy'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <p className="text-xl font-extrabold">{upcomingAppointments.length}</p>
              <p className="text-[10px] text-emerald-200 font-semibold">Upcoming</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <p className="text-xl font-extrabold">{mySlots.filter((s) => !s.is_booked).length}</p>
              <p className="text-[10px] text-emerald-200 font-semibold">Open Slots</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <p className="text-xl font-extrabold">{completedAppointments.length}</p>
              <p className="text-[10px] text-emerald-200 font-semibold">Completed</p>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="relative z-10 flex flex-wrap bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 gap-1 mt-6">
          {[
            { id: 'schedule', label: 'Upcoming Sessions', icon: CalendarIcon },
            { id: 'patients', label: 'My Patients', icon: User },
            { id: 'slots', label: 'Availability Calendar Picker', icon: Clock },
            { id: 'session_types', label: 'Session Rates', icon: IndianRupee },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveDoctorTab(id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDoctorTab === id
                  ? 'bg-white text-emerald-950 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB 1 — UPCOMING SESSIONS
      ══════════════════════════════════════════════════════════════ */}
      {activeDoctorTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="refreshing-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-emerald-600" /> Consultations &amp; Appointments
                </h3>

                {/* Filter Pills: Upcoming | Previous (History) | Missed */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setApptFilterTab('upcoming')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      apptFilterTab === 'upcoming'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upcoming ({upcomingAppointments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setApptFilterTab('completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      apptFilterTab === 'completed'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Previous History ({completedAppointments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setApptFilterTab('missed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      apptFilterTab === 'missed'
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Missed ({missedAppointments.length})
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredDoctorAppts.length === 0 ? (
                  <p className="text-center py-10 text-xs text-slate-400">
                    {apptFilterTab === 'upcoming'
                      ? 'No upcoming consultations scheduled currently.'
                      : apptFilterTab === 'completed'
                      ? 'No previous consultation history yet.'
                      : 'No missed consultations recorded.'}
                  </p>
                ) : (
                  filteredDoctorAppts.map((appt) => {
                    const effectiveStatus = getEffectiveAppointmentStatus(appt);
                    const isMissed = effectiveStatus === 'missed';
                    const isCompleted = effectiveStatus === 'completed';
                    const isUpcoming = effectiveStatus === 'scheduled' || effectiveStatus === 'in_progress';

                    return (
                      <div
                        key={appt.id}
                        className={`p-4 sm:p-5 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          isMissed
                            ? 'bg-rose-50/60 border-rose-200'
                            : isCompleted
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-gradient-to-br from-slate-50 to-emerald-50/30 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-800 font-extrabold text-lg shrink-0">
                            {appt.patient_name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-extrabold text-slate-900">{appt.patient_name}</h4>
                              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : isMissed
                                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                  : effectiveStatus === 'in_progress'
                                  ? 'bg-amber-100 text-amber-900 animate-pulse border border-amber-300'
                                  : 'bg-sky-100 text-sky-800 border border-sky-300'
                              }`}>
                                {isCompleted
                                  ? '✅ Previous Consultation'
                                  : isMissed
                                  ? '🔴 Missed Session'
                                  : effectiveStatus === 'in_progress'
                                  ? '⚡ Call In Progress'
                                  : 'Upcoming Consultation'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{appt.notes || 'Clinical Consultation'}</p>
                            <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                              {new Date(appt.scheduled_at).toLocaleDateString()} • {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {isMissed && (
                              <p className="text-[10px] text-rose-700 font-bold mt-1">
                                Notice: Missed session. No reminder sent to patient.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          {isUpcoming && (
                            <>
                              <button
                                onClick={() => {
                                  startDoctorCall(appt.id);
                                  setActiveTab('video_call');
                                }}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <Video className="w-4 h-4 text-emerald-200 animate-pulse" /> Start &amp; Join Session
                              </button>
                              <button
                                onClick={() => notifyPatientAgain(appt.id)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                              >
                                <Bell className="w-3.5 h-3.5" /> Remind Patient
                              </button>
                            </>
                          )}
                          {isCompleted && (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                              Archived in History
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Quick session notes sidebar */}
          <div className="space-y-4">
            {unresolvedCrisisCount > 0 && (
              <div className="refreshing-card p-4 border border-rose-200 bg-rose-50/60 space-y-3">
                <h4 className="text-sm font-extrabold text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Crisis Alerts
                </h4>
                {crisisLogs.filter((l) => !l.resolved).map((log) => (
                  <div key={log.id} className="p-3 bg-white border border-rose-200 rounded-xl text-xs space-y-1.5">
                    <p className="font-bold text-slate-900">{log.patient_name}</p>
                    <p className="text-rose-600 font-medium text-[11px]">{log.trigger_phrase_category}</p>
                    <button
                      onClick={() => resolveCrisisLog(log.id)}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Session notes */}
            <div className="refreshing-card p-5 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Session Notes
              </h4>
              {upcomingAppt ? (
                <>
                  <p className="text-xs text-slate-500">For: <strong className="text-slate-800">{upcomingAppt.patient_name}</strong></p>
                  <textarea
                    rows={5}
                    placeholder="Clinical session observations, treatment progress, next steps..."
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-emerald-400 focus:outline-none resize-none"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="w-full py-2 emerald-gradient-btn text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Notes
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No upcoming appointment to note.</p>
              )}
            </div>

            {/* Quick message */}
            <div className="refreshing-card p-5 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-600" /> Quick Patient Message
              </h4>
              <form onSubmit={handleSendReply} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Message your patient..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-sky-400 focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 2 — MY PATIENTS
      ══════════════════════════════════════════════════════════════ */}
      {activeDoctorTab === 'patients' && (
        <div className="space-y-6">
          <div className="refreshing-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" /> Patient Caseload
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">All patients who have booked sessions with you.</p>
              </div>
              <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                {appointments.length} Patient Records
              </span>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No patients yet. They will appear once they book a session.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appt) => (
                  <div key={appt.id} className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-800 font-extrabold text-base shrink-0">
                        {appt.patient_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{appt.patient_name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Consultation Session</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <p className="text-slate-500 text-[10px] font-semibold uppercase">Scheduled</p>
                        <p className="font-bold text-slate-800">{new Date(appt.scheduled_at).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <p className="text-slate-500 text-[10px] font-semibold uppercase">Time</p>
                        <p className="font-bold text-slate-800">{new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          startDoctorCall(appt.id);
                          setActiveTab('video_call');
                        }}
                        className="flex-1 py-2 emerald-gradient-btn text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> Start Call
                      </button>
                      <button
                        onClick={() =>
                          sendPrescription({
                            id: `rx-${Date.now()}`,
                            appointment_id: appt.id,
                            patient_id: appt.patient_id || 'patient-1',
                            patient_name: appt.patient_name,
                            therapist_name: user.full_name,
                            diagnosis: 'Anxiety & Stress Management',
                            medications: [],
                            general_instructions: 'Mindfulness Practice & Journaling Routine',
                            issued_at: new Date().toISOString(),
                            doctor_signature: user.full_name,
                            rx_number: `RX-${Math.floor(100000 + Math.random() * 900000)}`,
                          })
                        }
                        className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Prescribe
                      </button>
                    </div>

                    {patientDocuments.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Uploaded Documents</p>
                        {patientDocuments.slice(0, 2).map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-2.5">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-[11px] text-slate-800 font-medium truncate max-w-[140px]">{doc.file_name}</span>
                            </div>
                            <button
                              onClick={() => setDocPreviewUrl(doc.signed_url)}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {docPreviewUrl && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900">Patient Document Preview</h4>
                  <button onClick={() => setDocPreviewUrl(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <img src={docPreviewUrl} alt="Document" className="w-full rounded-2xl border border-slate-200 object-cover" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 3 — EASY CALENDAR DATE & TIME SLOT PICKER FOR DOCTORS
      ══════════════════════════════════════════════════════════════ */}
      {activeDoctorTab === 'slots' && (
        <div className="space-y-6">
          <div className="refreshing-card p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-1 border border-emerald-300">
                  <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" /> Doctor Calendar Availability Picker
                </div>
                <h3 className="text-xl font-black text-slate-900">Manage Consultation Schedule</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick a date from the calendar, select start time &amp; duration, and publish or batch add slots in 1 click.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {mySlots.filter((s) => !s.is_booked).length} Open Slots
                </span>
                <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {mySlots.filter((s) => s.is_booked).length} Booked
                </span>
              </div>
            </div>

            {/* ── Easy Calendar Date & Time Slot Form ── */}
            <div className="p-6 bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl shadow-xl space-y-5 border border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-emerald-200 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-400" /> Select Date &amp; Time from Calendar
                </h4>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleBatchAddSlots('morning')}
                    className="px-3 py-1.5 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 text-[11px] font-extrabold rounded-xl border border-emerald-400/40 transition-colors flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" /> + 3 Morning Slots (9, 10, 11 AM)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchAddSlots('afternoon')}
                    className="px-3 py-1.5 bg-teal-500/30 hover:bg-teal-500/50 text-teal-200 text-[11px] font-extrabold rounded-xl border border-teal-400/40 transition-colors flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" /> + 3 Afternoon Slots (2, 3, 4 PM)
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddSlotFromCalendar} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1. Date Picker */}
                  <div>
                    <label className="text-[11px] font-extrabold text-emerald-200 uppercase tracking-wider block mb-1.5">
                      1. Select Date (Calendar)
                    </label>
                    <input
                      type="date"
                      required
                      min={getTodayIsoString()}
                      value={slotDateInput}
                      onChange={(e) => setSlotDateInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-400 color-scheme-dark"
                    />
                    <span className="text-[10px] text-emerald-300/80 mt-1 block font-medium">
                      Formatted: <strong>{formatDayLabelFromDate(slotDateInput)}</strong>
                    </span>
                  </div>

                  {/* 2. Start Time Picker */}
                  <div>
                    <label className="text-[11px] font-extrabold text-emerald-200 uppercase tracking-wider block mb-1.5">
                      2. Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={slotTimeInput}
                      onChange={(e) => setSlotTimeInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                    <span className="text-[10px] text-emerald-300/80 mt-1 block font-medium">
                      Slot: <strong>{formatTimeRangeFromStart(slotTimeInput, slotDurationMins)}</strong>
                    </span>
                  </div>

                  {/* 3. Duration */}
                  <div>
                    <label className="text-[11px] font-extrabold text-emerald-200 uppercase tracking-wider block mb-1.5">
                      3. Duration
                    </label>
                    <select
                      value={slotDurationMins}
                      onChange={(e) => setSlotDurationMins(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-400"
                    >
                      {availableSessionTypes.map((st) => (
                        <option key={st.id} value={st.duration_minutes}>
                          {st.duration_minutes} Mins — {st.label} (₹{st.price})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-emerald-300/80 mt-1 block font-medium">
                      Session length for patient
                    </span>
                  </div>
                </div>

                {/* Quick Date Pills Shortcuts */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-emerald-200/80 font-bold">Quick Date Presets:</span>
                  {[
                    { label: 'Today', val: getTodayIsoString() },
                    { label: 'Tomorrow', val: getTomorrowIsoString() },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSlotDateInput(preset.val)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-full border transition-all ${
                        slotDateInput === preset.val
                          ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow'
                          : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Publish Available Slot ({formatDayLabelFromDate(slotDateInput)} @ {formatTimeRangeFromStart(slotTimeInput, slotDurationMins)})
                </button>
              </form>
            </div>

            {/* ── Active Slots Grid with Calendar Slot Editor ── */}
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                <span>Published Consultation Slots ({mySlots.length})</span>
                <span className="text-xs text-slate-500 font-normal">Click pencil ✏️ to edit any slot</span>
              </h4>

              {mySlots.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No availability slots created yet.</p>
                  <p className="text-[11px] text-slate-400 font-medium">Use the Calendar Picker above to add open dates &amp; times for patient booking.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        slot.is_booked
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {editingSlotId === slot.id ? (
                        /* ── Inline Calendar Slot Editor ── */
                        <div className="space-y-3 p-1">
                          <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                            <Pencil className="w-3.5 h-3.5" /> Edit Slot via Calendar
                          </p>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Select Date</label>
                            <input
                              type="date"
                              min={getTodayIsoString()}
                              value={editDateInput}
                              onChange={(e) => setEditDateInput(e.target.value)}
                              className="w-full px-3 py-1.5 border border-emerald-300 bg-emerald-50 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-slate-500 font-bold block mb-1">Start Time</label>
                              <input
                                type="time"
                                value={editTimeInput}
                                onChange={(e) => setEditTimeInput(e.target.value)}
                                className="w-full px-3 py-1.5 border border-emerald-300 bg-emerald-50 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 font-bold block mb-1">Duration</label>
                              <select
                                value={editDurationMins}
                                onChange={(e) => setEditDurationMins(Number(e.target.value))}
                                className="w-full px-2 py-1.5 border border-emerald-300 bg-emerald-50 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                              >
                                {availableSessionTypes.map((st) => (
                                  <option key={st.id} value={st.duration_minutes}>
                                    {st.duration_minutes}m (₹{st.price})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <p className="text-[10px] text-emerald-800 font-semibold">
                            New: {formatDayLabelFromDate(editDateInput)} ({formatTimeRangeFromStart(editTimeInput, editDurationMins)})
                          </p>
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleSaveEdit(slot.id)}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── Slot View Mode ── */
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 text-slate-900 font-extrabold text-xs">
                              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{slot.day_label}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600 font-medium text-xs mt-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{slot.time_label}</span>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-2 ${
                              slot.is_booked
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {slot.is_booked ? '🔒 Booked by Patient' : '✅ Open for Booking'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            {!slot.is_booked && (
                              <button
                                onClick={() => handleStartEdit(slot)}
                                className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                title="Edit slot date/time via Calendar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              disabled={slot.is_booked}
                              onClick={() => removeSlot(slot.id)}
                              className={`p-2 rounded-xl transition-colors ${
                                slot.is_booked
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-rose-500 hover:bg-rose-50'
                              }`}
                              title={slot.is_booked ? 'Cannot remove a booked slot' : 'Delete slot'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 4 — SESSION RATES & TYPES
      ══════════════════════════════════════════════════════════════ */}
      {activeDoctorTab === 'session_types' && (
        <div className="space-y-6">
          <div className="refreshing-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" /> Session Rates &amp; Durations Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set fixed charges for 30 min, 45 min, 1 hour (60 min), or custom duration sessions for your patients.
                </p>
              </div>
              <span className="text-xs font-extrabold text-sky-900 bg-sky-100 px-3.5 py-1.5 rounded-full border border-sky-300 self-start sm:self-auto">
                {mySessionTypes.filter((st) => st.is_active).length} Active Session Options
              </span>
            </div>

            {/* Quick Session Duration Chips */}
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl text-white space-y-2">
              <p className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-300" /> Select Duration Chip to Set Custom Fixed Charge Below
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setNewStDuration(30);
                    setNewStLabel('30-Minute Focus Session');
                  }}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                    newStDuration === 30
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow'
                      : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> 30 Min Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewStDuration(45);
                    setNewStLabel('45-Minute Therapy Session');
                  }}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                    newStDuration === 45
                      ? 'bg-teal-500 text-slate-950 border-teal-400 font-extrabold shadow'
                      : 'bg-teal-500/20 text-teal-200 border-teal-400/30 hover:bg-teal-500/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> 45 Min Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewStDuration(60);
                    setNewStLabel('60-Minute (1 Hour) Consultation');
                  }}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                    newStDuration === 60
                      ? 'bg-indigo-500 text-white border-indigo-400 font-extrabold shadow'
                      : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30 hover:bg-indigo-500/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> 1 Hour (60 Min) Session
                </button>
              </div>
            </div>

            {/* Add custom session type form */}
            <form onSubmit={handleAddSessionType} className="p-5 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-lg space-y-3">
              <p className="text-xs font-extrabold text-sky-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-sky-400" /> Add Custom Session Type &amp; Charge
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] font-semibold text-white/70 uppercase block mb-1">Session Title / Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45-Min Intensive Therapy"
                    value={newStLabel}
                    onChange={(e) => setNewStLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl text-xs focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-white/70 uppercase block mb-1">Duration (Min)</label>
                  <select
                    value={newStDuration}
                    onChange={(e) => setNewStDuration(Number(e.target.value))}
                    className="w-32 px-3 py-2.5 bg-slate-900 border border-white/20 text-white font-bold rounded-xl text-xs focus:outline-none"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Min (1 Hour)</option>
                    <option value={90}>90 Min (1.5 Hr)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-white/70 uppercase block mb-1">Fixed Charge (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={newStPrice}
                    onChange={(e) => setNewStPrice(Number(e.target.value))}
                    className="w-28 px-3 py-2.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow"
                >
                  <Plus className="w-4 h-4" /> Save Session Rate
                </button>
              </div>
            </form>

            {/* Session type cards grid with inline editing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySessionTypes.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs col-span-2 border-2 border-dashed border-slate-200 rounded-3xl space-y-1">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No session options configured yet.</p>
                  <p className="text-[11px] text-slate-400 font-medium">Use the Quick Presets above to add 30 min, 45 min, or 1 hr session options.</p>
                </div>
              ) : (
                mySessionTypes.map((st) => (
                  <div
                    key={st.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      st.is_active
                        ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    {editingStId === st.id ? (
                      /* Inline Session Rate Editor */
                      <div className="space-y-3">
                        <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5" /> Edit Fixed Session Charge
                        </p>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Session Label</label>
                          <input
                            type="text"
                            value={editStLabel}
                            onChange={(e) => setEditStLabel(e.target.value)}
                            className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/60 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Duration (Min)</label>
                            <select
                              value={editStDuration}
                              onChange={(e) => setEditStDuration(Number(e.target.value))}
                              className="w-full px-2 py-2 border border-emerald-300 bg-emerald-50/60 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                            >
                              <option value={30}>30 Minutes</option>
                              <option value={45}>45 Minutes</option>
                              <option value={60}>60 Min (1 Hour)</option>
                              <option value={90}>90 Min (1.5 Hr)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-1">Fixed Charge (₹)</label>
                            <input
                              type="number"
                              min={0}
                              value={editStPrice}
                              onChange={(e) => setEditStPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/60 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              updateSessionType(st.id, {
                                label: editStLabel,
                                duration_minutes: editStDuration,
                                price: editStPrice,
                              });
                              setEditingStId(null);
                            }}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Save Rate
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStId(null)}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Session Rate Card */
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-slate-900">{st.label}</h4>
                            <span className="px-2.5 py-0.5 bg-sky-100 text-sky-900 font-extrabold text-[10px] rounded-full border border-sky-300">
                              {st.duration_minutes === 60 ? '1 Hour (60m)' : `${st.duration_minutes} min`}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 pt-1">
                            <span className="text-2xl font-black text-emerald-700">₹{st.price}</span>
                            <span className="text-[11px] text-slate-400 font-semibold">fixed rate</span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-2 ${
                            st.is_active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            {st.is_active ? '✅ Available for Booking' : '⏸️ Paused'}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStId(st.id);
                              setEditStLabel(st.label);
                              setEditStDuration(st.duration_minutes);
                              setEditStPrice(st.price);
                            }}
                            className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors border border-transparent hover:border-sky-200"
                            title="Edit session duration or fixed charge"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSessionType(st.id)}
                            className={`p-2 rounded-xl transition-colors border ${
                              st.is_active
                                ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                                : 'text-slate-400 hover:bg-slate-100 border-slate-200'
                            }`}
                            title={st.is_active ? 'Pause session type' : 'Activate session type'}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSessionType(st.id)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                            title="Delete session type"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
