'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '@/components/UserAvatar';
import { AvailabilitySlot } from '@/lib/types';
import {
  Video,
  Calendar,
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
} from 'lucide-react';

interface DoctorPortalViewProps {
  setActiveTab: (tab: string) => void;
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
    toggleSessionType,
  } = useApp();

  const [activeDoctorTab, setActiveDoctorTab] = useState<
    'schedule' | 'patients' | 'slots' | 'session_types'
  >('schedule');

  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  const upcomingAppt = appointments.find((a) => a.status === 'scheduled' || a.status === 'in_progress') || appointments[0];
  const [currentNotes, setCurrentNotes] = useState<string>(
    sessionNotes[upcomingAppt?.id || ''] || ''
  );

  // Slot add form
  const [newDay, setNewDay] = useState('Tomorrow');
  const [newTime, setNewTime] = useState('2:00 PM - 2:50 PM');

  // Inline slot editing state
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editDay, setEditDay] = useState('');
  const [editTime, setEditTime] = useState('');

  // Session type inputs
  const [newStDuration, setNewStDuration] = useState<number>(45);
  const [newStPrice, setNewStPrice] = useState<number>(799);
  const [newStLabel, setNewStLabel] = useState<string>('45-Minute Intermediate Session');

  const [replyText, setReplyText] = useState('');

  const [carePlanTitle, setCarePlanTitle] = useState(carePlan.title);
  const [carePlanSummary, setCarePlanSummary] = useState(carePlan.summary);

  const mySessionTypes = sessionTypes.filter(
    (st) => st.counselor_id === user.id || st.counselor_id === 'therapist-1'
  );
  const mySlots = slots.filter(
    (s) => s.therapist_id === user.id || s.therapist_id === 'therapist-1'
  );

  const unresolvedCrisisCount = crisisLogs.filter((l) => !l.resolved).length;
  const upcomingAppointments = appointments.filter((a) => a.status === 'scheduled' || a.status === 'in_progress');
  const completedAppointments = appointments.filter((a) => a.status === 'completed');

  const handleSaveNotes = () => {
    if (upcomingAppt) {
      saveSessionNote(upcomingAppt.id, currentNotes);
      alert(`Clinical session notes saved for ${upcomingAppt.patient_name}`);
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDay.trim() || !newTime.trim()) return;
    addSlot(newDay, newTime);
    setNewDay('Tomorrow');
    setNewTime('2:00 PM - 2:50 PM');
  };

  const handleStartEdit = (slot: AvailabilitySlot) => {
    setEditingSlotId(slot.id);
    setEditDay(slot.day_label || '');
    setEditTime(slot.time_label || '');
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
    setEditDay('');
    setEditTime('');
  };

  const handleSaveEdit = (slotId: string) => {
    // Remove old slot and add updated one (re-use addSlot + removeSlot pattern)
    removeSlot(slotId);
    addSlot(editDay.trim() || 'Updated Day', editTime.trim() || 'Updated Time');
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

  const handlePublishCarePlan = (e: React.FormEvent) => {
    e.preventDefault();
    saveTherapistCarePlan({ title: carePlanTitle, summary: carePlanSummary });
    alert('Care Plan published and assigned to patient.');
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
                  <Stethoscope className="w-3 h-3" /> Licensed Practitioner
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
              <p className="text-xl font-extrabold">{mySlots.filter(s => !s.is_booked).length}</p>
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
            { id: 'schedule', label: 'Upcoming Sessions', icon: Calendar },
            { id: 'patients', label: 'My Patients', icon: User },
            { id: 'slots', label: 'Availability Slots', icon: Clock },
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
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-emerald-600" /> All Consultations
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {appointments.length} Total
                </span>
              </div>

              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <p className="text-center py-10 text-xs text-slate-400">No consultations yet. Slots you open will appear here once booked.</p>
                ) : (
                  appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-800 font-extrabold text-lg shrink-0">
                          {appt.patient_name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-slate-900">{appt.patient_name}</h4>
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                              appt.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appt.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-900 animate-pulse'
                                : 'bg-sky-100 text-sky-800'
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{appt.notes || 'Consultation Session'}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            {new Date(appt.scheduled_at).toLocaleDateString()} • {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        {appt.status !== 'completed' && (
                          <button
                            onClick={() => {
                              startDoctorCall(appt.id);
                              setActiveTab('video_call');
                            }}
                            className="px-4 py-2.5 emerald-gradient-btn text-white font-bold text-xs rounded-xl flex items-center gap-2"
                          >
                            <Video className="w-4 h-4" /> Start Video Call
                          </button>
                        )}
                        <button
                          onClick={() => notifyPatientAgain()}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" /> Remind Patient
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick session notes sidebar */}
          <div className="space-y-4">
            {/* Crisis alerts */}
            {unresolvedCrisisCount > 0 && (
              <div className="refreshing-card p-4 border border-rose-200 bg-rose-50/60 space-y-3">
                <h4 className="text-sm font-extrabold text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Crisis Alerts
                </h4>
                {crisisLogs.filter(l => !l.resolved).map((log) => (
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
                <MessageSquare className="w-4 h-4 text-sky-600" /> Quick Message
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
                    {/* Patient header */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-800 font-extrabold text-base shrink-0">
                        {appt.patient_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{appt.patient_name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Consultation Session
                        </p>
                      </div>
                    </div>

                    {/* Session info */}
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

                    {/* Actions */}
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
                        onClick={() => sendPrescription({
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
                        })}
                        className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Prescribe
                      </button>
                    </div>

                    {/* Patient docs */}
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

          {/* Document preview modal */}
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
          TAB 3 — AVAILABILITY SLOTS  (with inline editing)
      ══════════════════════════════════════════════════════════════ */}
      {activeDoctorTab === 'slots' && (
        <div className="space-y-6">
          <div className="refreshing-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" /> Availability Slot Manager
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add new open slots, or click the pencil icon to edit an existing slot's day and time.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {mySlots.filter(s => !s.is_booked).length} Open
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {mySlots.filter(s => s.is_booked).length} Booked
                </span>
              </div>
            </div>

            {/* ── Add new slot form ── */}
            <form onSubmit={handleAddSlot} className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl shadow-lg">
              <p className="text-xs font-bold text-emerald-200 mb-3">+ Add New Availability Slot</p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] font-semibold text-white/60 uppercase block mb-1">Day / Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomorrow, Mon Aug 12"
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl text-xs focus:outline-none focus:border-white/50"
                  />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="text-[10px] font-semibold text-white/60 uppercase block mb-1">Time Range</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3:00 PM - 3:50 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl text-xs focus:outline-none focus:border-white/50"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 hover:bg-emerald-50 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4 text-emerald-700" /> Publish Slot
                </button>
              </div>
            </form>

            {/* ── Slots grid ── */}
            {mySlots.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl">
                No slots added yet. Use the form above to publish your first availability slot.
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
                      /* ── Inline edit mode ── */
                      <div className="space-y-2.5">
                        <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Editing Slot</p>
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-1">Day / Date</label>
                          <input
                            type="text"
                            value={editDay}
                            onChange={(e) => setEditDay(e.target.value)}
                            className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-1">Time Range</label>
                          <input
                            type="text"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSaveEdit(slot.id)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── View mode ── */
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 truncate">{slot.day_label}</p>
                          <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">{slot.time_label}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-1.5 ${
                            slot.is_booked
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {slot.is_booked ? '🔒 Booked' : '✅ Open'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {!slot.is_booked && (
                            <button
                              onClick={() => handleStartEdit(slot)}
                              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                              title="Edit slot"
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
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB 4 — SESSION RATES & TYPES
      ══════════════════════════════════════════════════════════════ */}
      {activeDoctorTab === 'session_types' && (
        <div className="space-y-6">
          <div className="refreshing-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" /> Session Rates & Types
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure the session durations and fee schedule patients see when booking.
                </p>
              </div>
              <span className="text-xs font-extrabold text-sky-900 bg-sky-100 px-3 py-1 rounded-full border border-sky-300">
                {mySessionTypes.filter(st => st.is_active).length} Active Types
              </span>
            </div>

            {/* Add session type form */}
            <form onSubmit={handleAddSessionType} className="p-5 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-lg">
              <p className="text-xs font-bold text-sky-200 mb-3">+ Add Custom Session Type</p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-[10px] font-semibold text-white/60 uppercase block mb-1">Session Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45-Min Therapy Session"
                    value={newStLabel}
                    onChange={(e) => setNewStLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl text-xs focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-white/60 uppercase block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={120}
                    value={newStDuration}
                    onChange={(e) => setNewStDuration(Number(e.target.value))}
                    className="w-24 px-3 py-2.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-white/60 uppercase block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newStPrice}
                    onChange={(e) => setNewStPrice(Number(e.target.value))}
                    className="w-28 px-3 py-2.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-sky-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 hover:bg-sky-50 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4 text-sky-700" /> Add Type
                </button>
              </div>
            </form>

            {/* Session type cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mySessionTypes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center col-span-2 py-8">No session types yet. Add one above.</p>
              ) : (
                mySessionTypes.map((st) => (
                  <div
                    key={st.id}
                    className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                      st.is_active
                        ? 'bg-gradient-to-br from-sky-50/60 to-indigo-50/60 border-sky-200 shadow-sm'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-slate-900">{st.label}</h4>
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold text-[10px] rounded-full border border-sky-200">
                          {st.duration_minutes} min
                        </span>
                      </div>
                      <p className="text-xl font-black text-emerald-700 mt-1">₹{st.price}</p>
                    </div>

                    <button
                      onClick={() => toggleSessionType(st.id)}
                      className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all border flex items-center gap-1.5 ${
                        st.is_active
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {st.is_active ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Active</>
                      ) : (
                        <><AlertCircle className="w-3.5 h-3.5" /> Disabled</>
                      )}
                    </button>
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
