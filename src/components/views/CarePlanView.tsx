'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  CheckSquare,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Plus,
  RefreshCw,
  Award,
  ChevronRight,
} from 'lucide-react';

export const CarePlanView: React.FC = () => {
  const { user, carePlan, generateAiStarterPlan } = useApp();

  const [intakeGoal, setIntakeGoal] = useState('');
  const [intakeFeeling, setIntakeFeeling] = useState('');
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  const toggleExercise = (id: string) => {
    setCompletedExercises((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelfServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeGoal || !intakeFeeling) return;
    generateAiStarterPlan(intakeGoal, intakeFeeling);
  };

  const isTherapistAssigned = carePlan.source === 'therapist';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-3 py-0.5 text-xs font-bold rounded-full ${
                    isTherapistAssigned
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isTherapistAssigned ? 'Therapist Assigned Strategy' : 'AI Generated Starter Plan'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Updated {new Date(carePlan.updated_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {carePlan.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {carePlan.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Logic Branching: Show Plan if Therapist assigned OR AI generated */}
      {isTherapistAssigned ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Coping Strategies & Daily Exercises */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coping Strategies Section */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                Assigned Coping Strategies
              </h3>

              <div className="space-y-4">
                {carePlan.coping_strategies.map((cs) => (
                  <div
                    key={cs.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{cs.title}</h4>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {cs.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cs.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Exercises Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-700" />
                Daily Mindful Exercises Checklist
              </h3>

              <div className="space-y-3">
                {carePlan.daily_exercises.map((ex) => {
                  const isChecked = !!completedExercises[ex.id];
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleExercise(ex.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-500"
                        />
                        <div>
                          <p className={`text-xs font-bold ${isChecked ? 'line-through opacity-75' : ''}`}>
                            {ex.title}
                          </p>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Target: {ex.target_frequency} ({ex.duration})
                          </span>
                        </div>
                      </div>

                      {isChecked && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Completed Today ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Assigned Clinical Resources */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-700" />
                Recommended Reading & Guides
              </h3>

              <div className="space-y-2">
                {carePlan.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Opening document: ${res.title}`);
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl border border-slate-200 block text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <p className="flex items-center justify-between">
                      <span>{res.title}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Self-Service Starter Intake Form if no therapist plan exists */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 mx-auto mb-3 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Create Your AI Starter Care Plan
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              No therapist-assigned plan has been published yet. Complete this short intake to generate an immediate starter routine.
            </p>
          </div>

          <form onSubmit={handleSelfServiceSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Emotional State or Main Feeling
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mild work anxiety, trouble falling asleep"
                value={intakeFeeling}
                onChange={(e) => setIntakeFeeling(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Goal for Consultations
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Learn grounding breathwork and reframing negative thoughts"
                value={intakeGoal}
                onChange={(e) => setIntakeGoal(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Generate AI Starter Care Plan
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
