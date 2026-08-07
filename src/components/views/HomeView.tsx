'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Video,
  MessageSquare,
  Sparkles,
  Heart,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Smile,
  ShieldCheck,
  Sun,
  BookOpen,
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  const { user, appointments, startDoctorCall, carePlan } = useApp();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Find upcoming scheduled session
  const upcomingSession = appointments.find(
    (a) => a.status === 'scheduled' || a.status === 'in_progress'
  );

  const moods = [
    { label: 'Calm', emoji: '😌', bg: 'bg-emerald-50 text-emerald-800' },
    { label: 'Reflective', emoji: '🌿', bg: 'bg-teal-50 text-teal-800' },
    { label: 'Anxious', emoji: '🌧️', bg: 'bg-amber-50 text-amber-800' },
    { label: 'Tired', emoji: '🌙', bg: 'bg-indigo-50 text-indigo-800' },
    { label: 'Grateful', emoji: '✨', bg: 'bg-yellow-50 text-yellow-800' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Banner / Gentle Greeting */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Soft Decorative Orbs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-emerald-100 mb-3 border border-white/20">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            Mindful Daily Greeting
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Welcome back, {user.full_name.split(' ')[0]} 🌸
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed mb-6">
            Your safe space for guided psychology consultation, mindful breathing, and supportive care. Take a gentle breath in as you begin your day.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('booking')}
              className="px-5 py-2.5 bg-white text-emerald-900 rounded-2xl font-bold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              Book Consultation
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className="px-5 py-2.5 bg-emerald-900/60 hover:bg-emerald-900 text-white rounded-2xl font-semibold text-xs border border-emerald-500/30 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-teal-300" />
              AI Support Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Upcoming Session & Care Plan Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Session Card */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-700" />
                Upcoming Consultation Session
              </h3>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200/60">
                Doctor-Initiated Video
              </span>
            </div>

            {upcomingSession ? (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=250&auto=format&fit=crop&q=80"
                      alt="Therapist"
                      className="w-14 h-14 rounded-2xl border-2 border-emerald-600 object-cover shadow-xs"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {upcomingSession.therapist_name}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Consulting Psychologist • Cognitive Behavioral Therapy
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-emerald-800">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Today at 2:00 PM (50 mins)</span>
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
                        className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Start Session as Doctor
                      </button>
                    ) : (
                      <div className="text-right">
                        <button
                          onClick={() => setActiveTab('video_call')}
                          className="w-full px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Enter Consultation Room
                        </button>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Waiting state — session starts when doctor joins
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <Calendar className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  No upcoming session scheduled
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                  Select a convenient slot with Dr. Sarah Jenkins to receive guided therapy.
                </p>
                <button
                  onClick={() => setActiveTab('booking')}
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-emerald-800 transition-all inline-flex items-center gap-1.5"
                >
                  View Available Slots <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Active Care Plan Card */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Your Personalized Care Plan
                  </h3>
                  <span className="text-xs text-emerald-700 font-medium">
                    {carePlan.source === 'therapist'
                      ? 'Therapist Assigned Strategy'
                      : 'AI Generated Starter Plan'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('careplan')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
              >
                Full Plan →
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">{carePlan.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {carePlan.coping_strategies.slice(0, 2).map((cs) => (
                <div
                  key={cs.id}
                  className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs"
                >
                  <span className="font-bold text-emerald-950 block mb-1">
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

        {/* Right Column: Mood Check-in & Daily Tip */}
        <div className="space-y-6">
          {/* Mood Check-In Widget */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Smile className="w-5 h-5 text-emerald-700" />
              Daily Emotional Check-In
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              How are you feeling right now in this present moment?
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {moods.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMood(m.label)}
                  className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selectedMood === m.label
                      ? 'border-emerald-600 bg-emerald-100 text-emerald-950 shadow-2xs font-bold'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>

            {selectedMood && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
                <p className="font-semibold mb-1">Checked in: {selectedMood}</p>
                <p className="text-[11px] text-emerald-800">
                  Thank you for pausing to acknowledge your state. Remember that all emotions are valid waves.
                </p>
              </div>
            )}
          </div>

          {/* Daily Affirmation Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-6 border border-amber-200/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-3">
              Daily Mindfulness Insight
            </span>
            <blockquote className="text-sm font-medium text-amber-950 italic leading-relaxed mb-3">
              "Peace is not the absence of chaos, but the ability to remain calm in the midst of it."
            </blockquote>
            <p className="text-[11px] text-amber-800 font-semibold">
              — Dr. Sarah Jenkins Clinical Recommendation
            </p>
          </div>

          {/* Quick Access Grid */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Shortcuts
            </h3>
            <button
              onClick={() => setActiveTab('mindfulness')}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Mindfulness Library
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-left flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
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
