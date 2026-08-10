'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '@/components/UserAvatar';
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
  Pill,
  Lock,
  Star,
  Activity,
  Award,
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
    'schedule' | 'patients' | 'slots' | 'session_types' | 'messages' | 'careplans'
  >('schedule');

  const [selectedPatientId, setSelectedPatientId] = useState<string>('patient-1');
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  const upcomingAppt = appointments.find((a) => a.status === 'scheduled' || a.status === 'in_progress') || appointments[0];
  const [currentNotes, setCurrentNotes] = useState<string>(
    sessionNotes[upcomingAppt?.id || ''] || ''
  );

  const [newDay, setNewDay] = useState('Tomorrow');
  const [newTime, setNewTime] = useState('2:00 PM - 2:50 PM');

  // Custom Session Type Inputs
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

  const handleSaveNotes = () => {
    if (upcomingAppt) {
      saveSessionNote(upcomingAppt.id, currentNotes);
      alert(`Clinical session notes saved securely for ${upcomingAppt.patient_name}`);
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addSlot(newDay, newTime);
    alert('New consultation availability slot published!');
  };

  const handleAddSessionType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStLabel.trim()) return;
    addSessionType(newStDuration, newStPrice, newStLabel);
    setNewStLabel('');
    alert('Custom session type added successfully!');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendTherapistMessage(replyText);
    setReplyText('');
  };

  const handlePublishCarePlan = (e: React.FormEvent) => {
    e.preventDefault();
    saveTherapistCarePlan({
      title: carePlanTitle,
      summary: carePlanSummary,
    });
    alert('Care Plan published successfully! It will now override the patient starter intake plan.');
  };

  const unresolvedCrisisCount = crisisLogs.filter((l) => !l.resolved).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Clinical Header Banner with Doctor Portrait & Background Pattern */}
      <div className="relative bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden border border-white/10">
        <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} size="xl" />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-xs shadow">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-200 text-[11px] font-bold rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-emerald-300" />
                  Clinical Practitioner Console
                </span>
                {unresolvedCrisisCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-rose-500/30 text-rose-100 text-[11px] font-bold rounded-full border border-rose-400/40 flex items-center gap-1 animate-bounce">
                    <ShieldAlert className="w-3 h-3 text-rose-300" />
                    {unresolvedCrisisCount} Crisis Alert
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold">{user.full_name}</h2>
              <p className="text-xs text-emerald-100 font-medium">
                Licensed Clinical Psychologist • Cognitive Behavioral Therapy Practice
              </p>
            </div>
          </div>

          {/* Practitioner Sub-Navigation Tabs */}
          <div className="flex flex-wrap bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 gap-1">
            <button
              onClick={() => setActiveDoctorTab('schedule')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDoctorTab === 'schedule'
                  ? 'bg-white text-emerald-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Consultations
            </button>

            <button
              onClick={() => setActiveDoctorTab('patients')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDoctorTab === 'patients'
                  ? 'bg-white text-emerald-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-700" /> Patient Caseload
            </button>

            <button
              onClick={() => setActiveDoctorTab('slots')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDoctorTab === 'slots'
                  ? 'bg-white text-emerald-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-700" /> Availability Editor
            </button>

            <button
              onClick={() => setActiveDoctorTab('session_types')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDoctorTab === 'session_types'
                  ? 'bg-white text-emerald-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-700" /> Session Rates & Types
            </button>

            <button
              onClick={() => setActiveDoctorTab('messages')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDoctorTab === 'messages'
                  ? 'bg-white text-emerald-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" /> Inbox & Safety
            </button>

            <button
              onClick={() => setActiveDoctorTab('careplans')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeDoctorTab === 'careplans'
                  ? 'bg-white text-emerald-950 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" /> Care Plan Studio
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Doctor Consultations Schedule */}
      {activeDoctorTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="refreshing-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-emerald-600" />
                  Today's Clinical Consultations
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Doctor-Initiated Call Launcher
                </span>
              </div>

              <div className="space-y-4">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={appt.patient_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                        alt={appt.patient_name}
                        className="w-14 h-14 rounded-2xl border-2 border-emerald-500 object-cover shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{appt.patient_name}</h4>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              appt.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appt.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-900 animate-pulse'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {appt.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          Intake Focus: CBT for Panic & Anxiety
                        </p>
                        <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                          Scheduled Today at 2:00 PM (50 mins)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => {
                          startDoctorCall(appt.id);
                          setActiveTab('video_call');
                        }}
                        className="px-4 py-2.5 emerald-gradient-btn text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" /> Start Video Session
                      </button>

                      <button
                        onClick={notifyPatientAgain}
                        className="px-4 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5 text-sky-600" /> Ring Patient Again
                      </button>

                      <button
                        onClick={() => {
                          const rxNum = `RX-${Math.floor(100000 + Math.random() * 900000)}`;
                          sendPrescription({
                            id: `rx-${Date.now()}`,
                            appointment_id: appt.id,
                            patient_id: appt.patient_id,
                            patient_name: appt.patient_name,
                            therapist_name: user.full_name,
                            diagnosis: 'Generalized Anxiety & Stress Insomnia',
                            medications: [
                              {
                                id: `med-${Date.now()}`,
                                medication_name: 'Sertraline HCl',
                                dosage: '50 mg',
                                frequency: 'Once daily (Morning)',
                                duration: '30 Days',
                                instructions: 'Take with food. Stay hydrated.',
                              },
                            ],
                            general_instructions: 'Take as directed. Contact clinic if any side effects occur.',
                            issued_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            doctor_signature: `${user.full_name} • Lic #PSY-98241`,
                            rx_number: rxNum,
                          });
                          alert(`Prescription #${rxNum} sent directly to ${appt.patient_name}'s chat thread!`);
                        }}
                        className="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Pill className="w-3.5 h-3.5 text-emerald-600" /> Send Rx to Patient Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="refreshing-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Private Clinical Notes
                </h3>
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 emerald-gradient-btn text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>

              <textarea
                rows={8}
                placeholder="Record therapist notes, observations, or CBT assignments for Maya Lin..."
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">
                Encrypted storage. Confidential to attending psychologist only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Patient Caseload */}
      {activeDoctorTab === 'patients' && (
        <div className="refreshing-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Active Patient Caseload & Medical Documents
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Review intake reports, referral letters, and patient history.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assigned Patients (1)
              </span>
              <div
                onClick={() => setSelectedPatientId('patient-1')}
                className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-2xl cursor-pointer flex items-center gap-3 shadow-2xs"
              >
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                  alt="Maya Lin"
                  className="w-12 h-12 rounded-2xl border-2 border-emerald-500 object-cover shadow-2xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Maya Lin</h4>
                  <span className="text-[11px] text-emerald-800 font-semibold block">
                    CBT Focus • Social Anxiety & Stress
                  </span>
                  <span className="text-[10px] text-slate-500">Member since Aug 2026</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Uploaded Patient Records ({patientDocuments.length})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patientDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                        {doc.file_size}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {doc.file_name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => setDocPreviewUrl(doc.signed_url)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" /> View Document Signed URL
                    </button>
                  </div>
                ))}
              </div>

              {docPreviewUrl && (
                <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-950">
                      Authenticated Document Preview
                    </span>
                    <button
                      onClick={() => setDocPreviewUrl(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Close Preview
                    </button>
                  </div>
                  <img
                    src={docPreviewUrl}
                    alt="Document Preview"
                    className="w-full h-48 object-cover rounded-xl border border-emerald-300 shadow-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Availability Slot Management */}
      {activeDoctorTab === 'slots' && (
        <div className="refreshing-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Manage Therapist Consultation Slots
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Add open consultation availability or remove unbooked slots.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddSlot} className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl flex flex-wrap items-center gap-3 shadow-md">
            <input
              type="text"
              required
              placeholder="Day (e.g. Tomorrow)"
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="px-3.5 py-2 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-xl text-xs focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Time (e.g. 3:00 PM - 3:50 PM)"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="px-3.5 py-2 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-xl text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white text-emerald-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:bg-emerald-50"
            >
              <Plus className="w-4 h-4 text-emerald-700" /> Publish Available Slot
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySlots.map((slot) => (
              <div
                key={slot.id}
                className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{slot.day_label}</span>
                  <span className="text-xs text-slate-600 font-medium">{slot.time_label}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                      slot.is_booked
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {slot.is_booked ? 'Booked by Patient' : 'Open'}
                  </span>
                </div>

                <button
                  disabled={slot.is_booked}
                  onClick={() => removeSlot(slot.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    slot.is_booked
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                  title={slot.is_booked ? 'Cannot remove an availability slot that is already booked by a patient!' : 'Remove slot'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3.5: Counselor Session Types & Pricing Manager */}
      {activeDoctorTab === 'session_types' && (
        <div className="refreshing-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Counselor Session Durations & Fee Schedule
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Configure offered session types (30-min, 60-min, or custom durations) and patient consultation fees.
              </p>
            </div>
            <span className="text-xs font-extrabold text-sky-900 bg-sky-100 px-3 py-1 rounded-full border border-sky-300">
              {mySessionTypes.filter((st) => st.is_active).length} Active Session Types
            </span>
          </div>

          <form onSubmit={handleAddSessionType} className="p-4 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-2xl flex flex-wrap items-center gap-3 shadow-md">
            <input
              type="text"
              required
              placeholder="Session Label (e.g. 45-Min Therapy)"
              value={newStLabel}
              onChange={(e) => setNewStLabel(e.target.value)}
              className="px-3.5 py-2 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-xl text-xs focus:outline-none flex-1 min-w-[200px]"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-sky-200">Duration (mins):</span>
              <input
                type="number"
                required
                min={15}
                max={120}
                value={newStDuration}
                onChange={(e) => setNewStDuration(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-white/10 border border-white/20 text-white font-bold rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-sky-200">Price (₹):</span>
              <input
                type="number"
                required
                min={0}
                value={newStPrice}
                onChange={(e) => setNewStPrice(Number(e.target.value))}
                className="w-24 px-3 py-2 bg-white/10 border border-white/20 text-white font-bold rounded-xl text-xs focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-sky-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:bg-sky-50"
            >
              <Plus className="w-4 h-4 text-sky-700" /> Add Session Type
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mySessionTypes.map((st) => (
              <div
                key={st.id}
                className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                  st.is_active
                    ? 'bg-gradient-to-br from-sky-50/70 to-indigo-50/70 border-sky-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{st.label}</h4>
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-900 font-bold text-[10px] rounded-full border border-sky-300">
                      {st.duration_minutes} Mins
                    </span>
                  </div>
                  <p className="text-xl font-black text-emerald-700 mt-1">₹{st.price}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSessionType(st.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                    st.is_active
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {st.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Messages & Safety Alerts */}
      {activeDoctorTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="refreshing-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Patient Crisis Safety Alerts ({crisisLogs.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Surfaced when AI assistant detects high emotional distress intent.
            </p>

            <div className="space-y-3">
              {crisisLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    log.resolved
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-amber-50/90 border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.patient_name}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                      {log.trigger_phrase_category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    Flagged at {new Date(log.created_at).toLocaleString()}
                  </p>

                  {!log.resolved && (
                    <button
                      onClick={() => resolveCrisisLog(log.id)}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                    >
                      Mark Follow-up Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 refreshing-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Patient Consultation Thread (Maya Lin)
            </h3>

            <div className="h-80 overflow-y-auto p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
              {therapistMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender_id === user.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                      msg.sender_id === user.id
                        ? 'emerald-gradient-btn text-white font-medium'
                        : 'bg-white border border-slate-200 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <span className="font-bold block text-[10px] opacity-75 mb-1">
                      {msg.sender_name}
                    </span>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                placeholder="Send message to Maya Lin..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 emerald-gradient-btn text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 5: Care Plan Studio */}
      {activeDoctorTab === 'careplans' && (
        <div className="refreshing-card p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Therapist Care Plan Authoring Studio
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Assign clinical coping strategies and daily exercises directly to Maya Lin's profile.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
              Therapist Priority Overrides Starter Form
            </span>
          </div>

          <form onSubmit={handlePublishCarePlan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Care Plan Title
              </label>
              <input
                type="text"
                required
                value={carePlanTitle}
                onChange={(e) => setCarePlanTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Overview & Strategy Summary
              </label>
              <textarea
                rows={4}
                required
                value={carePlanSummary}
                onChange={(e) => setCarePlanSummary(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-950 block">
                Assigned Coping Strategies (CBT & Grounding)
              </span>
              <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside font-medium">
                <li>Box Breathing (4-4-4-4 technique)</li>
                <li>5-4-3-2-1 Sensory Grounding Technique</li>
                <li>Cognitive Reframing Journaling</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-3 emerald-gradient-btn text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Publish & Assign Care Plan to Patient
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
