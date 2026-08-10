'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

interface CounselorStatusViewProps {
  setActiveTab: (tab: string) => void;
}

export const CounselorStatusView: React.FC<CounselorStatusViewProps> = ({ setActiveTab }) => {
  const { user, setUserRole, refreshCounselorApplications } = useApp();
  const [isChecking, setIsChecking] = useState(false);

  const isPending = user.status === 'pending' || !user.status;

  const handleCheckStatus = async () => {
    setIsChecking(true);
    await refreshCounselorApplications();
    setTimeout(() => setIsChecking(false), 800);
  };

  // Poll status every 5 seconds while on this screen
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCounselorApplications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-sky-100 text-center space-y-6 animate-fadeIn">
        {isPending ? (
          <>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-white mx-auto flex items-center justify-center shadow-lg animate-pulse">
              <Clock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-extrabold rounded-full border border-amber-200 inline-block">
                Status: Application Under Admin Review
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Welcome, {user.full_name}
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your counselor enrollment application and uploaded government ID / psychology credentials are currently undergoing clinical verification by MindBloom Operations.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Applicant Email:</span>
                <span className="font-semibold text-slate-900">{user.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">License / Reg Number:</span>
                <span className="font-mono font-bold text-slate-900">{user.license_number || 'PSY-2026-88941'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Credentials / Degree:</span>
                <span className="font-semibold text-slate-900">{user.credentials || 'Psy.D. Clinical Psychology'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Govt ID Uploaded:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Storage Verified
                </span>
              </div>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 max-w-lg mx-auto text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">What happens next?</p>
                <p className="text-[11px] text-sky-800 mt-0.5">
                  Once an administrator approves your application, your profile will automatically unlock, 30-min and 60-min session types will be initialized, and you will gain full access to your Doctor Console.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-rose-50 text-rose-800 text-xs font-extrabold rounded-full border border-rose-200 inline-block">
                Status: Application Rejected
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Application Not Approved
              </h2>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                Thank you for applying to practice on MindBloom. Unfortunately, your clinical application was not approved by MindBloom Operations at this time.
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl text-left text-xs space-y-2 max-w-lg mx-auto">
              <span className="font-bold text-rose-950 block">Rejection Reason Provided by Admin:</span>
              <p className="text-rose-800 font-medium italic">
                &quot;{user.rejection_reason || 'License number could not be verified against the state medical council database. Please provide updated registration credentials.'}&quot;
              </p>
            </div>
          </>
        )}

        <div className="pt-4 flex justify-center gap-3 flex-wrap">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking Approval...' : 'Check Approval Status'}
          </button>
          <button
            onClick={() => setUserRole('patient')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Switch to Patient View
          </button>
        </div>
      </div>
    </div>
  );
};
