'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MindBloomWebRTC } from '@/lib/webrtc';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Bell,
  ShieldCheck,
  FileText,
  User,
  Save,
  Eye,
  Lock,
  Pill,
  Send,
} from 'lucide-react';

export const VideoCallView: React.FC = () => {
  const {
    user,
    activeSession,
    appointments,
    startDoctorCall,
    notifyPatientAgain,
    endActiveSession,
    therapistJoinedCall,
    patientDocuments,
    sessionNotes,
    saveSessionNote,
    carePlan,
    saveTherapistCarePlan,
    sendPrescription,
  } = useApp();

  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(user.role === 'therapist');
  const [activeSideTab, setActiveSideTab] = useState<'notes' | 'prescription' | 'docs' | 'careplan'>('notes');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const rtcManagerRef = useRef<MindBloomWebRTC | null>(null);

  const currentAppt = activeSession || appointments[0];
  const [noteContent, setNoteContent] = useState(sessionNotes[currentAppt?.id || ''] || '');
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);

  // Doctor Prescription State
  const [rxDiagnosis, setRxDiagnosis] = useState('Generalized Anxiety & Stress Insomnia');
  const [rxMedName, setRxMedName] = useState('Sertraline HCl');
  const [rxDosage, setRxDosage] = useState('50 mg');
  const [rxFrequency, setRxFrequency] = useState('Once daily (Morning)');
  const [rxDuration, setRxDuration] = useState('30 Days');
  const [rxInstructions, setRxInstructions] = useState('Take after breakfast with water. Avoid late evening caffeine.');

  // Initialize Free WebRTC Media & Connection
  useEffect(() => {
    const rtc = new MindBloomWebRTC();
    rtcManagerRef.current = rtc;

    rtc.initializeLocalStream(localVideoRef.current || undefined);
    rtc.createPeerConnection((remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    return () => {
      rtc.closeSession();
    };
  }, []);

  // Toggle Microphone Track
  const toggleMute = () => {
    if (rtcManagerRef.current) {
      const state = rtcManagerRef.current.toggleAudio();
      setIsMuted(!state);
    } else {
      setIsMuted(!isMuted);
    }
  };

  // Toggle Camera Track
  const toggleCamera = () => {
    if (rtcManagerRef.current) {
      const state = rtcManagerRef.current.toggleVideo();
      setIsCamOff(!state);
    }
  };

  const handleSaveNotes = () => {
    if (currentAppt) {
      saveSessionNote(currentAppt.id, noteContent);
      alert('Session notes saved securely!');
    }
  };

  const handleDispatchPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxMedName.trim()) {
      alert('Please enter at least one medication name.');
      return;
    }

    const rxNumber = `RX-${Math.floor(100000 + Math.random() * 900000)}`;
    sendPrescription({
      id: `rx-${Date.now()}`,
      appointment_id: currentAppt?.id,
      patient_id: currentAppt?.patient_id || 'patient-1',
      patient_name: currentAppt?.patient_name || 'Maya Lin',
      therapist_name: user.full_name || 'Dr. Sarah Jenkins, Psy.D.',
      diagnosis: rxDiagnosis,
      medications: [
        {
          id: `med-${Date.now()}`,
          medication_name: rxMedName,
          dosage: rxDosage,
          frequency: rxFrequency,
          duration: rxDuration,
          instructions: rxInstructions,
        },
      ],
      general_instructions: rxInstructions,
      issued_at: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      doctor_signature: `${user.full_name || 'Dr. Sarah Jenkins'}, Psy.D. • Lic #PSY-98241`,
      rx_number: rxNumber,
    });

    alert(`Prescription #${rxNumber} sent directly to patient chat!`);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* Status Bar */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Encrypted Free WebRTC Room
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-full border border-emerald-200">
                Open-Source STUN Connected
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Consulting: {user.role === 'therapist' ? 'Maya Lin (Patient)' : 'Dr. Sarah Jenkins, Psy.D.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'therapist' && (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => currentAppt && startDoctorCall(currentAppt.id)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5"
                >
                  <VideoIcon className="w-3.5 h-3.5" /> Start Call
                </button>
                <button
                  onClick={notifyPatientAgain}
                  className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-semibold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-teal-700" /> Ring Patient
                </button>
              </div>

              <button
                onClick={() => setShowSidePanel(!showSidePanel)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                {showSidePanel ? 'Hide Tools' : 'Show Therapist Tools'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Video & Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Video Screen */}
        <div className={`${user.role === 'therapist' && showSidePanel ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
              {therapistJoinedCall || user.role === 'therapist' ? (
                <img
                  src={
                    user.role === 'therapist'
                      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=800&auto=format&fit=crop&q=80'
                  }
                  alt="Remote Participant"
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-900/50 text-emerald-300 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30 animate-pulse">
                    <VideoIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Waiting for Dr. Sarah Jenkins to connect...
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Connecting via Free Native WebRTC (STUN: google.com:19302). Session connects when doctor joins.
                  </p>
                </div>
              )}
            </div>

            {/* Local Video Inset */}
            <div className="absolute bottom-4 right-4 w-36 sm:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-900 z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCamOff ? 'hidden' : 'block'}`}
              />
              {isCamOff && (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                  <VideoOff className="w-6 h-6" />
                </div>
              )}
              <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-white/90 bg-slate-900/70 px-1.5 py-0.5 rounded">
                You ({user.full_name.split(' ')[0]})
              </span>
            </div>

            {/* Security Badge */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Free WebRTC Peer Stream
            </div>

            {/* Controls Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-xl font-bold transition-all ${
                  isMuted
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-3 rounded-xl font-bold transition-all ${
                  isCamOff
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isCamOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isCamOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
              </button>

              <button
                onClick={endActiveSession}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <PhoneOff className="w-4 h-4" /> End Call
              </button>
            </div>
          </div>
        </div>

        {/* In-Session Tools Side Panel (Therapist Only) */}
        {user.role === 'therapist' && showSidePanel && (
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-4">
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-0.5 overflow-x-auto">
              <button
                onClick={() => setActiveSideTab('notes')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeSideTab === 'notes'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveSideTab('prescription')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeSideTab === 'prescription'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pill className="w-3 h-3" /> Rx Prescription
              </button>
              <button
                onClick={() => setActiveSideTab('docs')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeSideTab === 'docs'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Docs
              </button>
              <button
                onClick={() => setActiveSideTab('careplan')}
                className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeSideTab === 'careplan'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Care Plan
              </button>
            </div>

            {activeSideTab === 'prescription' && (
              <form onSubmit={handleDispatchPrescription} className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-700" />
                    Doctor Rx Authoring
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                    Direct Patient Chat Delivery
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Clinical Diagnosis
                  </label>
                  <input
                    type="text"
                    required
                    value={rxDiagnosis}
                    onChange={(e) => setRxDiagnosis(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Medication Name
                    </label>
                    <input
                      type="text"
                      required
                      value={rxMedName}
                      onChange={(e) => setRxMedName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      required
                      value={rxDosage}
                      onChange={(e) => setRxDosage(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      required
                      value={rxFrequency}
                      onChange={(e) => setRxFrequency(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      required
                      value={rxDuration}
                      onChange={(e) => setRxDuration(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Special Patient Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={rxInstructions}
                    onChange={(e) => setRxInstructions(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Final Prescription to Patient Chat
                </button>
              </form>
            )}

            {activeSideTab === 'notes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                    Private Therapist Notes
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Save className="w-3 h-3" /> Save Notes
                  </button>
                </div>

                <textarea
                  rows={8}
                  placeholder="Record clinical impressions, progress indicators, or CBT homework assignments..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            )}

            {activeSideTab === 'docs' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Patient Uploaded Records ({patientDocuments.length})
                </span>

                <div className="space-y-2">
                  {patientDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[170px]">
                          {doc.file_name}
                        </p>
                        <p className="text-[10px] text-slate-500">{doc.file_size}</p>
                      </div>

                      <button
                        onClick={() => setDocPreviewUrl(doc.signed_url)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg flex items-center gap-1 border border-emerald-200"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  ))}
                </div>

                {docPreviewUrl && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-950">Document Preview</span>
                      <button
                        onClick={() => setDocPreviewUrl(null)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Close
                      </button>
                    </div>
                    <img
                      src={docPreviewUrl}
                      alt="Intake Preview"
                      className="w-full h-36 object-cover rounded-xl border border-emerald-200 shadow-2xs"
                    />
                  </div>
                )}
              </div>
            )}

            {activeSideTab === 'careplan' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Assign Coping Strategies</span>
                </div>

                <div className="space-y-2">
                  {carePlan.coping_strategies.map((cs) => (
                    <div key={cs.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <p className="font-bold text-slate-900">{cs.title}</p>
                      <p className="text-[11px] text-slate-600">{cs.description}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    saveTherapistCarePlan({
                      title: 'Dr. Jenkins Updated Care Plan',
                      summary: 'Therapist added progressive muscle relaxation & thought journaling homework.',
                    });
                    alert('Care Plan updated and assigned directly to patient profile!');
                  }}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  Assign Updated Care Plan
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
