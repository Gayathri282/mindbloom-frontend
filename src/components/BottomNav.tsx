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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-emerald-900/10 shadow-2xl py-2 px-3">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-700 text-white font-bold shadow-md scale-105'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/80'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
