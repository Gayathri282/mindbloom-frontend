'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { getEffectiveAppointmentStatus } from '@/lib/slotUtils';
import {
  Calendar,
  Video,
  MessageSquare,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  Smile,
  Sun,
  BookOpen,
  Star,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  const { user, appointments, startDoctorCall, carePlan } = useApp();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const upcomingSession = appointments.find((a) => {
    const status = getEffectiveAppointmentStatus(a);
    return (
      (status === 'scheduled' || status === 'in_progress') &&
      (a.patient_id === user.id || a.patient_email === user.email || user.role === 'patient')
    );
  });

  const historySessions = appointments.filter((a) => {
    const status = getEffectiveAppointmentStatus(a);
    return status === 'completed' || status === 'missed' || status === 'cancelled';
  });

  const moods = [
    { label: 'Calm', emoji: '😌', bg: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/70' },
    { label: 'Reflective', emoji: '🌊', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100/70' },
    { label: 'Anxious', emoji: '🌧️', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100/70' },
    { label: 'Tired', emoji: '🌙', bg: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100/70' },
    { label: 'Grateful', emoji: '✨', bg: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70' },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Hero Banner with High Quality Scenery & Calm Blue Gradient */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-500/20 bg-slate-950 text-white min-h-[260px] flex items-center">
        {/* Serene Blue Water/Scenery Photo */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&auto=format&fit=crop&q=80"
          alt="Tranquil Ocean Scenery"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
        />
        {/* Gradient Overlay Mesh */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-sky-950/90 to-transparent"></div>
        <div className="absolute inset-0 pattern-dots opacity-25 pointer-events-none"></div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-sky-500/20 backdrop-blur-md rounded-full text-xs font-bold text-sky-200 mb-3 border border-sky-400/30">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            Mindful Daily Workspace
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
            Good day, <span className="text-sky-300">{user.full_name.split(' ')[0]}</span> 🌊
          </h2>
          <p className="text-sky-100/90 text-xs sm:text-sm leading-relaxed mb-6 font-medium max-w-lg">
            Your serene space for psychologist consultation, CBT guided reflection, and personalized daily care routines.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('booking')}
              className="px-5 py-3 blue-gradient-btn text-white rounded-2xl font-bold text-xs flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-sky-100" />
              Book Consultation Session
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-bold text-xs border border-white/30 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-cyan-200" />
              AI Support Companion
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Session Card */}
          <div className="refreshing-card p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-sky-600" />
                Upcoming Consultation Session
              </h3>
              <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">
                Encrypted Video Call Format
              </span>
            </div>

            {upcomingSession ? (
              <div className="bg-gradient-to-br from-sky-50/80 to-cyan-50/60 border border-sky-200/80 rounded-2xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=300&auto=format&fit=crop&q=80"
                        alt="Dr. Sarah Jenkins"
                        className="w-16 h-16 rounded-2xl border-2 border-sky-500 object-cover shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        ✓
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className="text-base font-extrabold text-slate-900">
                          {upcomingSession.therapist_name}
                        </h4>
                        <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.98
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Consulting Psychologist • Cognitive Behavioral Therapy
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-sky-700">
                        <Clock className="w-4 h-4 text-sky-600" />
                        <span>Scheduled Today at 2:00 PM (50 mins)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {user.role === 'therapist' ? (
                      <button
                        onClick={() => {
                          startDoctorCall(upcomingSession.id);
                          setActiveTab('video_call');
                        }}
                        className="px-5 py-3 blue-gradient-btn text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Start Session as Doctor
                      </button>
                    ) : (
                      <div className="text-right">
                        <button
                          onClick={() => setActiveTab('video_call')}
                          className="w-full px-5 py-3 blue-gradient-btn text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Enter Consultation Room
                        </button>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          Join window active • Connect directly
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl relative overflow-hidden">
                <Calendar className="w-10 h-10 text-sky-500 mx-auto mb-2 opacity-90" />
                <p className="text-sm font-bold text-slate-800 mb-1">
                  No upcoming session scheduled
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4 font-medium">
                  Select a convenient slot with Dr. Sarah Jenkins to receive guided therapy.
                </p>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="px-4 py-2.5 blue-gradient-btn text-white text-xs font-bold rounded-xl inline-flex items-center gap-2"
                >
                  View Available Slots <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Consultation History Card */}
          <div className="refreshing-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                Consultation History &amp; Previous Sessions
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {historySessions.length} Past Records
              </span>
            </div>

            {historySessions.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                No past or missed consultations on record.
              </div>
            ) : (
              <div className="space-y-3">
                {historySessions.map((session) => {
                  const effectiveStatus = getEffectiveAppointmentStatus(session);
                  const isMissed = effectiveStatus === 'missed';
                  const isCompleted = effectiveStatus === 'completed';

                  return (
                    <div
                      key={session.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isMissed
                          ? 'bg-rose-50/60 border-rose-200'
                          : isCompleted
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-extrabold text-slate-900">
                            {session.therapist_name || 'Consulting Psychologist'}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 font-extrabold text-[10px] rounded-full border ${
                              isMissed
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : isCompleted
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-slate-200 text-slate-700 border-slate-300'
                            }`}
                          >
                            {isMissed
                              ? '🔴 Missed Consultation'
                              : isCompleted
                              ? '✅ Previous Consultation'
                              : 'Cancelled'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Date: {new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {isMissed && (
                          <p className="text-[10px] text-rose-700 font-semibold mt-1">
                            Notice: Missed session. No reminder sent to patient. You can book a new slot anytime.
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isCompleted && (
                          <button
                            onClick={() => setActiveTab('careplan')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
                          >
                            View Rx / Care Plan
                          </button>
                        )}
                        {isMissed && (
                          <button
                            onClick={() => setActiveTab('booking')}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all"
                          >
                            Book New Slot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Care Plan Card */}
          <div className="refreshing-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold shadow-2xs">
                  <FileText className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Your Personalized Care Plan
                  </h3>
                  <span className="text-xs text-sky-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    {carePlan.source === 'therapist'
                      ? 'Therapist Priority Strategy'
                      : 'AI Generated Starter Routine'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('careplan')}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors flex items-center gap-1"
              >
                Full Plan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">{carePlan.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {carePlan.coping_strategies.slice(0, 2).map((cs) => (
                <div
                  key={cs.id}
                  className="p-4 bg-gradient-to-br from-sky-50/70 to-slate-50 border border-sky-100 rounded-2xl text-xs space-y-1"
                >
                  <span className="font-bold text-slate-900 block">
                    {cs.title}
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {cs.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mood Check-In Widget */}
          <div className="refreshing-card p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Smile className="w-5 h-5 text-sky-600" />
              Daily Emotional Check-In
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              How are you feeling in this present moment?
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {moods.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m.label)}
                  className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedMood === m.label
                      ? 'border-sky-500 bg-sky-100/90 text-sky-950 font-bold shadow-2xs'
                      : `${m.bg}`
                  }`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>

            {selectedMood && (
              <div className="p-3.5 bg-sky-50/90 border border-sky-200 rounded-2xl text-xs text-sky-900 animate-fadeIn">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" /> Checked in: {selectedMood}
                </p>
                <p className="text-[11px] text-sky-800 font-medium">
                  Thank you for pausing to notice your emotions. Every feeling is a valid wave.
                </p>
              </div>
            )}
          </div>

          {/* Tranquil Ocean Scenery Affirmation Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200 text-white min-h-[220px] flex flex-col justify-end p-6">
            <img
              src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80"
              alt="Calm Ocean Landscape"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 photo-vignette"></div>

            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 bg-slate-900/70 backdrop-blur-md px-2.5 py-0.5 rounded-full inline-block border border-white/20">
                Daily Insight
              </span>
              <blockquote className="text-xs font-semibold text-white italic leading-relaxed">
                "Like the ocean, your mind has calm depths below the surface waves."
              </blockquote>
              <p className="text-[11px] text-sky-200 font-bold">
                — Dr. Sarah Jenkins Recommendation
              </p>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="refreshing-card p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Explore Services
            </h3>
            <button
              onClick={() => setActiveTab('mindfulness')}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/70 border border-slate-100 text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                Mindfulness Library
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/70 border border-slate-100 text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                Peer Support Forums
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
