'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Heart,
  Calendar,
  MessageSquare,
  Sparkles,
  FileText,
  Users,
  Stethoscope,
  Shield,
  Video,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useApp();

  let navItems = [];

  if (user.role === 'therapist') {
    navItems = [
      { id: 'doctor_portal', label: 'Practice Console', icon: Stethoscope },
      { id: 'video_call', label: 'Consultation Room', icon: Video },
      { id: 'chat', label: 'Patient Inbox', icon: MessageSquare },
      { id: 'careplan', label: 'Care Plan Studio', icon: FileText },
    ];
  } else if (user.role === 'admin') {
    navItems = [
      { id: 'admin', label: 'Admin Ops', icon: Shield },
      { id: 'home', label: 'Patient Preview', icon: Heart },
      { id: 'chat', label: 'AI Safety Audit', icon: MessageSquare },
    ];
  } else {
    navItems = [
      { id: 'home', label: 'Home', icon: Heart },
      { id: 'booking', label: 'Sessions', icon: Calendar },
      { id: 'chat', label: 'Chat & AI', icon: MessageSquare },
      { id: 'mindfulness', label: 'Mindfulness', icon: Sparkles },
      { id: 'careplan', label: 'Care Plan', icon: FileText },
      { id: 'community', label: 'Community', icon: Users },
    ];
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <div className="max-w-md md:max-w-2xl mx-auto glass-dock rounded-3xl p-1.5 sm:p-2 pointer-events-auto shadow-xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 sm:px-3.5 sm:py-2 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'blue-gradient-btn text-white font-bold scale-105'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/70'
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-sky-600'}`} />
                {/* On mobile devices, hide text labels and show ONLY icons */}
                <span className="text-[11px] tracking-tight hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
