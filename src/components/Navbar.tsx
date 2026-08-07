'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Flower2,
  User,
  ShieldAlert,
} from 'lucide-react';

interface NavbarProps {
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveTab,
  openAuthModal,
}) => {
  const { user, activeSession, crisisLogs } = useApp();
  const unresolvedCrisisCount = crisisLogs.filter((l) => !l.resolved).length;

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-emerald-900/10 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab(user.role === 'therapist' ? 'doctor_portal' : 'home')}
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <Flower2 className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-emerald-950 flex items-center gap-1">
                Mind<span className="text-emerald-700">Bloom</span>
              </span>
              <span className="text-[11px] text-emerald-800 font-semibold tracking-wide">
                {user.role === 'therapist'
                  ? 'Clinical Practice Console'
                  : 'Psychologist Consultation & Care'}
              </span>
            </div>
          </div>

          {/* Right Controls (Active Session Indicator + Urgent Alerts + Profile avatar) */}
          <div className="flex items-center gap-3">
            {/* Urgent Crisis Notification Badge for Therapist */}
            {user.role === 'therapist' && unresolvedCrisisCount > 0 && (
              <button
                onClick={() => setActiveTab('doctor_portal')}
                className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs animate-bounce"
                title={`${unresolvedCrisisCount} Patient Crisis Alert`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {unresolvedCrisisCount} Crisis Alert
              </button>
            )}

            {/* Active Session / Call Indicator Pill */}
            {activeSession && (
              <button
                onClick={() => setActiveTab('video_call')}
                className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xs hover:bg-emerald-700 animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-white"></span>
                Consultation Active
              </button>
            )}

            {/* User Profile Avatar & Account Settings */}
            <div className="flex items-center gap-2 pl-2 border-l border-emerald-900/10">
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity"
              >
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-9 h-9 rounded-full border-2 border-emerald-600 object-cover shadow-2xs"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user.full_name}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
