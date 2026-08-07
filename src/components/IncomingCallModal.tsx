'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Video, PhoneOff, Phone, Bell, ShieldCheck } from 'lucide-react';

interface IncomingCallModalProps {
  onAccept: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ onAccept }) => {
  const { activeIncomingCall, acceptIncomingCall, declineIncomingCall, user } = useApp();

  // Show call modal only if patient is logged in and there is an active incoming call
  if (!activeIncomingCall || user.role !== 'patient') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-center relative overflow-hidden">
        {/* Soft Background Decorative Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-100 rounded-full blur-2xl opacity-60"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-100 rounded-full blur-2xl opacity-60"></div>

        {/* Pulse Ring Video Call Icon */}
        <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse"></div>
          <img
            src={activeIncomingCall.therapist_name.includes('Jenkins')
              ? 'https://images.unsplash.com/photo-1594824813566-78a9c3d4a4d6?w=250&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80'
            }
            alt="Therapist"
            className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md z-10"
          />
          <div className="absolute bottom-0 right-0 z-20 bg-emerald-600 text-white p-1.5 rounded-full shadow-md">
            <Video className="w-4 h-4" />
          </div>
        </div>

        {/* Call Info Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full mb-3 border border-emerald-200/60">
          <Bell className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
          Incoming Video Consultation Call
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">
          {activeIncomingCall.therapist_name}
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Your consulting psychologist is ready to start your scheduled session.
        </p>

        {/* Safety Note */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-6 flex items-start gap-2.5 text-left text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            This session takes place in an end-to-end encrypted private video room. Your camera & audio controls remain under your full control.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              declineIncomingCall();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            <PhoneOff className="w-4 h-4 text-slate-500" />
            Decline
          </button>

          <button
            onClick={() => {
              acceptIncomingCall();
              onAccept();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
          >
            <Phone className="w-4 h-4 text-white" />
            Accept Call
          </button>
        </div>
      </div>
    </div>
  );
};
