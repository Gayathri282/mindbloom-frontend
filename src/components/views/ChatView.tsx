'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CrisisResourceCard } from '@/components/CrisisResourceCard';
import {
  MessageSquare,
  Sparkles,
  Send,
  ShieldCheck,
  User,
  Bot,
  AlertTriangle,
  Lock,
  HeartHandshake,
  Pill,
  Download,
  CheckCircle,
  FileText,
  Stethoscope,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    user,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [therapistMessages, aiMessages, activeTab]);

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
    <div className="max-w-4xl mx-auto space-y-4 pb-10">
      {/* Top Thread Switcher */}
      <div className="bg-white rounded-3xl p-3 border border-emerald-100 shadow-sm flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          {/* AI Support Assistant Tab (Visually Distinct Accent) */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Support Assistant
            <span className="bg-emerald-800 text-[10px] text-white px-2 py-0.5 rounded-full font-semibold">
              24/7 Safety
            </span>
          </button>

          {/* Therapist Consultation Chat Tab */}
          <button
            onClick={() => setActiveTab('therapist')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'therapist'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-teal-300" />
            Dr. Sarah Jenkins Thread
            {!isChatUnlocked && (
              <Lock className="w-3 h-3 text-amber-300 ml-1" />
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/60 text-xs font-semibold text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Encrypted & Confidential
        </div>
      </div>

      {/* Main Message Window */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Header Bar depending on active thread */}
        {activeTab === 'ai' ? (
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/30 border border-teal-300/40 text-teal-200 flex items-center justify-center shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  MindBloom AI Mindfulness Companion
                  <span className="text-[10px] bg-teal-400/20 text-teal-200 px-2 py-0.5 rounded-full border border-teal-400/30">
                    Psychoeducation Only
                  </span>
                </h3>
                <p className="text-[11px] text-teal-100">
                  Grounding strategies, relaxation exercises, & automatic crisis detection
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=150&auto=format&fit=crop&q=80"
                alt="Dr. Jenkins"
                className="w-10 h-10 rounded-2xl border-2 border-white object-cover shadow-2xs"
              />
              <div>
                <h3 className="text-sm font-bold">Dr. Sarah Jenkins, Psy.D.</h3>
                <p className="text-[11px] text-emerald-100">
                  {isChatUnlocked
                    ? 'Permanent Consultation Thread Active'
                    : 'Unlocked after your first booked consultation'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lock Overlay for Therapist Chat if no booking made yet */}
        {activeTab === 'therapist' && !isChatUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4 border border-amber-200">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Therapist Consultation Thread Locked
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mb-6">
              Direct consultation messaging with Dr. Sarah Jenkins unlocks automatically once your first session is booked.
            </p>
          </div>
        ) : (
          <>
            {/* Messages Container */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {/* If Crisis Triggered, show top Crisis Alert Banner */}
              {activeTab === 'ai' && lastCrisisTriggered && (
                <CrisisResourceCard onDismiss={dismissCrisisAlert} isInline />
              )}

              {(activeTab === 'ai' ? aiMessages : therapistMessages).map((msg) => {
                const isUser = msg.sender_id === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                      {!isUser && (
                        <img
                          src={
                            msg.is_ai
                              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                              : 'https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=100&auto=format&fit=crop&q=80'
                          }
                          alt="Avatar"
                          className="w-7 h-7 rounded-full border border-emerald-600 object-cover shrink-0 mb-1"
                        />
                      )}

                      <div
                        className={`p-4 rounded-3xl text-xs leading-relaxed shadow-2xs ${
                          msg.is_prescription
                            ? 'bg-white border-2 border-emerald-600 text-slate-900 rounded-bl-sm w-full sm:max-w-md'
                            : msg.is_crisis
                            ? 'bg-amber-50 border-2 border-amber-300 text-slate-900 rounded-bl-sm'
                            : isUser
                            ? 'bg-emerald-700 text-white rounded-br-sm font-medium'
                            : msg.is_ai
                            ? 'bg-white border border-teal-200 text-slate-900 rounded-bl-sm'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                        }`}
                      >
                        <span className="font-bold block text-[10px] opacity-75 mb-1">
                          {msg.sender_name}
                        </span>

                        {msg.is_prescription && msg.prescription_data ? (
                          <div className="space-y-3">
                            {/* Rx Header Badge */}
                            <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-3.5 rounded-2xl flex items-center justify-between border border-emerald-600">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-700/60 rounded-xl text-emerald-200">
                                  <Pill className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-extrabold tracking-wide uppercase">
                                    Official Medical Prescription
                                  </h4>
                                  <span className="text-[10px] text-emerald-200 font-semibold block">
                                    Rx #: {msg.prescription_data.rx_number}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] bg-emerald-400/20 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
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

                            {/* Clinical Diagnosis */}
                            <div className="text-[11px] bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                              <span className="text-emerald-900 font-bold block text-[10px] mb-0.5">
                                Clinical Impression / Diagnosis:
                              </span>
                              <p className="text-emerald-950 font-medium">{msg.prescription_data.diagnosis}</p>
                            </div>

                            {/* Medications */}
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                                <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                                Prescribed Medications ({msg.prescription_data.medications.length})
                              </span>

                              {msg.prescription_data.medications.map((med) => (
                                <div
                                  key={med.id}
                                  className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-900">{med.medication_name}</span>
                                    <span className="text-[10px] bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded">
                                      {med.dosage}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] text-slate-600">
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
                                <span className="font-bold text-emerald-900 block flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  Electronically Signed
                                </span>
                                <span>{msg.prescription_data.doctor_signature}</span>
                              </div>

                              <button
                                onClick={() => alert(`Downloading official PDF copy of Prescription ${msg.prescription_data?.rx_number}...`)}
                                className="w-full sm:w-auto px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-2xs transition-colors shrink-0"
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
                          <div className="mt-3 pt-3 border-t border-amber-200">
                            <CrisisResourceCard isInline />
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })}
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
                    ? 'Ask AI Guide for coping strategies or grounding exercises...'
                    : 'Message Dr. Sarah Jenkins...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />

              <button
                type="submit"
                className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
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
