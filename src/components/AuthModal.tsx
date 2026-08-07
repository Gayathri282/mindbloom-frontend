'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginUser, signupUser, authError, authSuccess, clearAuthMessages, setUserRole } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (mode === 'signin') {
      const success = loginUser(email);
      if (success) {
        setTimeout(() => {
          onClose();
          clearAuthMessages();
        }, 1200);
      }
    } else {
      const success = signupUser(email, fullName);
      if (success) {
        setTimeout(() => {
          onClose();
          clearAuthMessages();
        }, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 relative">
        <button
          onClick={() => {
            clearAuthMessages();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white mx-auto mb-3 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {mode === 'signin' ? 'Welcome Back to MindBloom' : 'Begin Your Care Journey'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {mode === 'signin'
              ? 'Sign in to access your consultations & care plans'
              : 'Create your private, safe MindBloom patient account'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => {
              setMode('signin');
              clearAuthMessages();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              clearAuthMessages();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Alerts */}
        {authError && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2 text-xs text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="maya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2"
          >
            {mode === 'signin' ? 'Sign In to Account' : 'Create Patient Account'}
          </button>
        </form>

        {/* Demo Quick Accounts Pill */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 mb-2 font-medium">Or test as seeded demo account:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setUserRole('patient');
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-lg hover:bg-emerald-100 border border-emerald-200"
            >
              Maya Lin (Patient)
            </button>
            <button
              onClick={() => {
                setUserRole('therapist');
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-lg hover:bg-emerald-100 border border-emerald-200"
            >
              Dr. Jenkins (Therapist)
            </button>
            <button
              onClick={() => {
                setUserRole('admin');
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-100 text-slate-800 text-[11px] font-semibold rounded-lg hover:bg-slate-200 border border-slate-200"
            >
              Admin Ops
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
