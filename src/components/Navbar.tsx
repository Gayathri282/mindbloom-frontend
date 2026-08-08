'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldAlert,
  Zap,
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
    <div className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <header className="max-w-6xl mx-auto glass-dock rounded-3xl px-4 sm:px-6 shadow-xl border border-white/80 pointer-events-auto transition-all">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Top Left Corner: Large Borderless Logo Only */}
          <div
            className="flex items-center cursor-pointer group py-1"
            onClick={() => setActiveTab(user.role === 'therapist' ? 'doctor_portal' : 'home')}
            title="MindBloom"
          >
            <img
              src="/logo.png"
              alt="MindBloom Logo"
              className="h-12 sm:h-14 w-auto object-contain group-hover:scale-105 transition-all duration-300"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Urgent Crisis Notification Badge for Therapist */}
            {user.role === 'therapist' && unresolvedCrisisCount > 0 && (
              <button
                onClick={() => setActiveTab('doctor_portal')}
                className="bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs animate-bounce"
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
                className="blue-gradient-btn text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xs animate-pulse"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                Session Active
              </button>
            )}

            {/* User Profile Avatar & Role Switcher */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100/80 transition-all"
              >
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-sky-500 object-cover shadow-2xs"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-sky-700 font-semibold capitalize">
                    {user.role}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
