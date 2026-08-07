'use client';

import React from 'react';
import { CRISIS_RESOURCES } from '@/lib/crisisDetection';
import { ShieldAlert, PhoneCall, MessageSquare, HeartHandshake, AlertCircle, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CrisisResourceCardProps {
  onDismiss?: () => void;
  isInline?: boolean;
}

export const CrisisResourceCard: React.FC<CrisisResourceCardProps> = ({
  onDismiss,
  isInline = false,
}) => {
  const { sendTherapistMessage } = useApp();

  const handleTherapistAlert = () => {
    sendTherapistMessage('URGENT: I am currently experiencing high distress and requested urgent therapist support via the Crisis Safety Assistant.');
    alert('An urgent priority message has been sent to Dr. Sarah Jenkins. If you are in immediate danger, please call 988 or 911 right away.');
  };

  return (
    <div className={`rounded-3xl border border-amber-200 bg-amber-50/90 p-5 sm:p-6 shadow-sm ${isInline ? 'my-4' : 'my-2'}`}>
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
            Immediate Support & Safety Care
          </span>
          <h4 className="text-base font-bold text-slate-900">
            We are here for you — Free, Confidential Support 24/7
          </h4>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
            Your safety and well-being come first. If you or someone you know is in distress or having thoughts of self-harm, please connect with one of these resources right away:
          </p>
        </div>
      </div>

      {/* Resource Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {CRISIS_RESOURCES.map((res, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs hover:border-amber-400 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">{res.name}</span>
                {res.type === 'phone' && <PhoneCall className="w-4 h-4 text-amber-700" />}
                {res.type === 'text' && <MessageSquare className="w-4 h-4 text-amber-700" />}
                {res.type === 'therapist_alert' && <ShieldAlert className="w-4 h-4 text-emerald-700" />}
                {res.type === 'emergency' && <AlertCircle className="w-4 h-4 text-red-600" />}
              </div>
              <p className="text-xs font-bold text-amber-900 mb-1">{res.contact}</p>
              <p className="text-[11px] text-slate-600 leading-snug">{res.detail}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100">
              {res.actionUrl ? (
                <a
                  href={res.actionUrl}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white transition-all shadow-2xs ${
                    res.type === 'emergency'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  Connect Now <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  onClick={handleTherapistAlert}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-2xs"
                >
                  Send Priority Alert to Dr. Jenkins
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {onDismiss && (
        <div className="text-right">
          <button
            onClick={onDismiss}
            className="text-xs font-semibold text-amber-900 hover:underline"
          >
            I understand, return to chat
          </button>
        </div>
      )}
    </div>
  );
};
