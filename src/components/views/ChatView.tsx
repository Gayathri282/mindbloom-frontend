'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { UserAvatar } from '@/components/UserAvatar';
import { CrisisResourceCard } from '@/components/CrisisResourceCard';
import {
  MessageSquare,
  Sparkles,
  Send,
  ShieldCheck,
  Bot,
  Lock,
  Pill,
  Download,
  CheckCircle,
  Stethoscope,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    user,
    usersList,
    appointments,
    isChatUnlocked,
    therapistMessages,
    sendTherapistMessage,
    aiMessages,
    sendAiMessage,
    lastCrisisTriggered,
    dismissCrisisAlert,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'therapist' | 'ai'>('ai');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // List counselors patient has booked appointments with
  const bookedCounselorIds = Array.from(
    new Set(
      appointments
        .filter((a) => a.patient_id === user.id || a.patient_id === 'patient-1')
        .map((a) => a.therapist_id)
    )
  );

  const approvedCounselors = usersList.filter(
    (u) => (u.role === 'counselor' || u.role === 'therapist') && (u.status === 'approved' || !u.status)
  );

  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(
    bookedCounselorIds[0] || approvedCounselors[0]?.id || ''
  );

  const selectedCounselorObj =
    approvedCounselors.find((c) => c.id === selectedCounselorId) || approvedCounselors[0];

  // Scoped unlocked check per counselor: unlocked if patient has booked with THIS specific counselor
  const isCounselorChatUnlocked = appointments.some(
    (a) =>
      a.patient_id === user.id &&
      a.therapist_id === selectedCounselorId
  );

  // Scoped messages per counselor-patient pair
  const scopedTherapistMessages = therapistMessages.filter(
    (m) =>
      (m.sender_id === selectedCounselorId && m.receiver_id === user.id) ||
      (m.sender_id === user.id && m.receiver_id === selectedCounselorId)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [therapistMessages, aiMessages, activeTab, selectedCounselorId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeTab === 'therapist') {
      sendTherapistMessage(inputText);
    } else {
      sendAiMessage(inputText);
    }
    setInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      {/* Top Thread Switcher */}
      <div className="refreshing-card p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex bg-slate-100/80 p-1 rounded-2xl w-full sm:w-auto">
          {/* AI Support Assistant Tab */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai'
                ? 'blue-gradient-btn text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            AI Support Assistant
            <span className="bg-sky-950/40 text-[10px] text-white px-2 py-0.5 rounded-full font-semibold">
              24/7 Safety
            </span>
          </button>

          {/* Therapist Consultation Chat Tab */}
          <button
            onClick={() => setActiveTab('therapist')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'therapist'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-sky-300" />
            Counselor Thread
            {!isCounselorChatUnlocked && (
              <Lock className="w-3 h-3 text-amber-300 ml-1" />
            )}
          </button>
        </div>

        {/* Per-Counselor Thread Selector */}
        {activeTab === 'therapist' && user.role === 'patient' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600">Select Counselor:</span>
            <select
              value={selectedCounselorId}
              onChange={(e) => setSelectedCounselorId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {approvedCounselors.map((c) => {
                const isUnlocked = bookedCounselorIds.includes(c.id);
                return (
                  <option key={c.id} value={c.id}>
                    {c.full_name} {isUnlocked ? ' (Unlocked ✓)' : ' (Locked 🔒)'}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-sky-50/80 rounded-full border border-sky-200/60 text-xs font-semibold text-sky-800">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          Encrypted & Confidential
        </div>
      </div>

      {/* Main Message Window */}
      <div className="refreshing-card border border-sky-100 flex flex-col h-[600px] overflow-hidden">
        {/* Header Bar depending on active thread */}
        {activeTab === 'ai' ? (
          <div className="bg-gradient-to-r from-sky-700 via-cyan-700 to-indigo-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  MindBloom AI Mindfulness Companion
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 font-semibold">
                    Psychoeducation
                  </span>
                </h3>
                <p className="text-[11px] text-sky-100">
                  Grounding strategies, relaxation exercises, & automatic crisis detection
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-sky-900 to-indigo-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar name={selectedCounselorObj?.full_name || 'Dr. Sarah Jenkins, Psy.D.'} avatarUrl={selectedCounselorObj?.avatar_url} size="sm" />
              <div>
                <h3 className="text-sm font-bold">{selectedCounselorObj?.full_name || 'Dr. Sarah Jenkins'}</h3>
                <p className="text-[11px] text-sky-100">
                  {isCounselorChatUnlocked
                    ? 'Permanent Consultation Thread Active'
                    : 'Unlocked after booking a consultation with this counselor'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lock Overlay for Counselor Chat if no booking made yet */}
        {activeTab === 'therapist' && !isCounselorChatUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-1 border border-amber-200 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Direct Messaging Locked for {selectedCounselorObj?.full_name}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm font-medium">
                Direct messaging with <span className="font-bold text-slate-900">{selectedCounselorObj?.full_name}</span> unlocks automatically once your first consultation slot with them is booked via Razorpay.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Container */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
              {/* If Crisis Triggered, show top Crisis Alert Banner */}
              {activeTab === 'ai' && lastCrisisTriggered && (
                <CrisisResourceCard onDismiss={dismissCrisisAlert} isInline />
              )}

              {(activeTab === 'ai' ? aiMessages : scopedTherapistMessages).length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-medium">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-sky-400 opacity-60" />
                  No messages yet in this thread. Start by typing a message below.
                </div>
              ) : (
                (activeTab === 'ai' ? aiMessages : scopedTherapistMessages).map((msg) => {
                  const isUser = msg.sender_id === user.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                        {!isUser && (
                          <UserAvatar name={msg.sender_name} avatarUrl={msg.sender_avatar} size="xs" />
                        )}

                        <div
                          className={`p-4 rounded-3xl text-xs leading-relaxed shadow-2xs ${
                            msg.is_prescription
                              ? 'bg-white border-2 border-sky-500 text-slate-900 rounded-bl-sm w-full sm:max-w-md'
                              : msg.is_crisis
                              ? 'bg-rose-50 border-2 border-rose-300 text-slate-900 rounded-bl-sm'
                              : isUser
                              ? 'blue-gradient-btn text-white rounded-br-sm font-medium'
                              : msg.is_ai
                              ? 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                          }`}
                        >
                          <span className="font-bold block text-[10px] opacity-75 mb-1">
                            {msg.sender_name}
                          </span>

                          {msg.is_prescription && msg.prescription_data ? (
                            <div className="space-y-3">
                              {/* Rx Header Badge */}
                              <div className="bg-gradient-to-r from-sky-700 to-indigo-800 text-white p-3.5 rounded-2xl flex items-center justify-between border border-sky-600">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-sky-600/60 rounded-xl text-sky-100">
                                    <Pill className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-extrabold tracking-wide uppercase">
                                      Official Medical Prescription
                                    </h4>
                                    <span className="text-[10px] text-sky-100 font-semibold block">
                                      Rx #: {msg.prescription_data.rx_number}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full border border-white/30">
                                  Verified
                                </span>
                              </div>

                              {/* Patient & Prescriber Info */}
                              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Patient:</span>
                                  <span className="font-bold text-slate-900">{msg.prescription_data.patient_name}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Issued Date:</span>
                                  <span className="font-semibold text-slate-900">{msg.prescription_data.issued_at}</span>
                                </div>
                              </div>

                              {/* Clinical Impression */}
                              <div className="text-[11px] bg-sky-50/80 p-2.5 rounded-xl border border-sky-100">
                                <span className="text-sky-900 font-bold block text-[10px] mb-0.5">
                                  Clinical Impression / Diagnosis:
                                </span>
                                <p className="text-sky-950 font-medium">{msg.prescription_data.diagnosis}</p>
                              </div>

                              {/* Medications */}
                              <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                                  Prescribed Medications ({msg.prescription_data.medications.length})
                                </span>

                                {msg.prescription_data.medications.map((med) => (
                                  <div
                                    key={med.id}
                                    className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-slate-900">{med.medication_name}</span>
                                      <span className="text-[10px] bg-cyan-100 text-cyan-900 font-bold px-2 py-0.5 rounded">
                                        {med.dosage}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                                      <span>Frequency: {med.frequency}</span>
                                      <span>Duration: {med.duration}</span>
                                    </div>
                                    {med.instructions && (
                                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100 mt-1">
                                        Note: {med.instructions}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Signature & Actions */}
                              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                                <div className="text-[10px] text-slate-600">
                                  <span className="font-bold text-sky-800 block flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-sky-600" />
                                    Electronically Signed
                                  </span>
                                  <span>{msg.prescription_data.doctor_signature}</span>
                                </div>

                                <button
                                  onClick={() => alert(`Downloading official PDF copy of Prescription ${msg.prescription_data?.rx_number}...`)}
                                  className="w-full sm:w-auto px-3 py-1.5 blue-gradient-btn text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-2xs shrink-0"
                                >
                                  <Download className="w-3 h-3" />
                                  Save PDF
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}

                          {msg.is_crisis && (
                            <div className="mt-3 pt-3 border-t border-rose-200">
                              <CrisisResourceCard isInline />
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-3"
            >
              <input
                type="text"
                placeholder={
                  activeTab === 'ai'
                    ? 'Ask AI Companion for coping strategies or grounding exercises...'
                    : 'Message Dr. Sarah Jenkins...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
              />

              <button
                type="submit"
                className="px-5 py-3 blue-gradient-btn text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
