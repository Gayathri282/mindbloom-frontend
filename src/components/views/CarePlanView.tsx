'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  CheckSquare,
  Sparkles,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

export const CarePlanView: React.FC = () => {
  const { carePlan, generateAiStarterPlan } = useApp();

  const [showIntakeForm, setShowIntakeForm] = useState<boolean>(false);
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
    setShowIntakeForm(false);
  };

  const isTherapistAssigned = carePlan.source === 'therapist';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="refreshing-card p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl blue-gradient-btn text-white flex items-center justify-center shadow-md shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-3 py-0.5 text-xs font-bold rounded-full ${
                    isTherapistAssigned
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isTherapistAssigned ? 'Therapist Assigned Strategy' : 'AI Generated Starter Plan'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Updated {new Date(carePlan.updated_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {carePlan.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl font-medium">
                {carePlan.summary}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowIntakeForm((prev) => !prev)}
            className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs rounded-xl border border-sky-200 flex items-center gap-1.5 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-sky-700" />
            {showIntakeForm ? 'View Active Plan' : 'Build Custom AI Starter Routine'}
          </button>
        </div>
      </div>

      {/* Render Intake Form if requested or if no plan active */}
      {showIntakeForm ? (
        /* Self-Service Starter Intake Form */
        <div className="refreshing-card p-6 sm:p-8 max-w-2xl mx-auto space-y-6 animate-fadeIn">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100/80 text-cyan-700 mx-auto mb-3 flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Create Your AI Starter Care Plan
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Specify your primary feeling and goals to generate a personalized grounding routine.
            </p>
          </div>

          <form onSubmit={handleSelfServiceSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Main Feeling or Stress Focus *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Work anxiety, burnout, difficulty focusing"
                value={intakeFeeling}
                onChange={(e) => setIntakeFeeling(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Goal for Self-Care *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Learn breathwork, quiet bedtime thoughts, improve focus"
                value={intakeGoal}
                onChange={(e) => setIntakeGoal(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIntakeForm(false)}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 blue-gradient-btn text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-200" /> Generate AI Starter Care Plan
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coping Strategies Section */}
            <div className="refreshing-card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                Assigned Coping Strategies
              </h3>

              <div className="space-y-4">
                {carePlan.coping_strategies.map((cs) => (
                  <div
                    key={cs.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{cs.title}</h4>
                      <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full border border-sky-200">
                        {cs.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {cs.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Exercises Checklist */}
            <div className="refreshing-card p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-sky-600" />
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
                          ? 'bg-sky-50/90 border-sky-300 text-sky-950 font-medium'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/70 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
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
                        <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
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
            <div className="refreshing-card p-6">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" />
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
                    className="p-3 bg-slate-50 hover:bg-sky-50/80 rounded-2xl border border-slate-200 block text-xs font-semibold text-slate-800 transition-colors"
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
      )}
    </div>
  );
};
