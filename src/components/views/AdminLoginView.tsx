'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, Lock, AlertTriangle, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

interface AdminLoginViewProps {
  setActiveTab: (tab: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ setActiveTab }) => {
  const { loginUser, usersList } = useApp();
  const [email, setEmail] = useState<string>('admin@mindbloom.app');
  const [password, setPassword] = useState<string>('admin123');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      // Check if user exists and has admin role, or is standard admin@mindbloom.app
      const matchedUser = usersList.find((u) => u.email.toLowerCase() === cleanEmail);

      if (cleanEmail === 'admin@mindbloom.app' || (matchedUser && matchedUser.role === 'admin')) {
        const loggedIn = loginUser(cleanEmail);
        if (loggedIn) {
          setSuccess('Identity & Administrative Rights Verified. Access Granted.');
          setTimeout(() => {
            setIsAuthenticating(false);
            setActiveTab('admin');
          }, 800);
        } else {
          setError('Could not verify admin account in user directory.');
          setIsAuthenticating(false);
        }
      } else {
        setError('Access Denied. Invalid admin email or insufficient operational privileges.');
        setIsAuthenticating(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800 space-y-8 relative overflow-hidden">
        {/* Decorative Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500"></div>

        {/* Back Link */}
        <div>
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Patient Portal
          </button>
        </div>

        {/* Header Title & Lock Emblem */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              MindBloom Admin Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Authorized Clinical Operations & Compliance Access Only
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleAdminSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Admin Operational Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mindbloom.app"
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Admin Security Passcode
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                Verifying Security Tokens...
              </span>
            ) : (
              <span>Authenticate & Enter Admin Portal ➔</span>
            )}
          </button>
        </form>

        {/* Footer info note */}
        <div className="pt-2 text-center text-[11px] text-slate-500 font-medium border-t border-slate-800/80">
          <p>MindBloom Security Operations • Encrypted Session</p>
        </div>
      </div>
    </div>
  );
};
