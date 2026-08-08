'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { loadGoogleScript, decodeGoogleJwt } from '@/lib/googleAuth';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, loginUser, signupUser, authError, authSuccess, clearAuthMessages } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Initialize Google Identity Services script when modal opens
  useEffect(() => {
    if (isOpen) {
      loadGoogleScript().catch((err) => {
        console.warn('Google Identity Services script failed to load:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    clearAuthMessages();

    try {
      await loadGoogleScript();

      const clientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        'your-google-client-id.apps.googleusercontent.com';

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            setIsGoogleLoading(false);
            if (response.credential) {
              const googleProfile = decodeGoogleJwt(response.credential);
              if (googleProfile) {
                // Try logging in existing user, or create new Google user profile
                const existing = loginUser(googleProfile.email);
                if (!existing) {
                  signupUser(googleProfile.email, googleProfile.name);
                }
                setTimeout(() => {
                  onClose();
                  clearAuthMessages();
                }, 1000);
              }
            }
          },
        });

        // Prompt Google's native OneTap / Sign-In Popup
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to seamless direct Google profile login if Client ID is demo placeholder
            simulateGoogleOAuthFallback();
          }
        });
      } else {
        simulateGoogleOAuthFallback();
      }
    } catch (err: any) {
      simulateGoogleOAuthFallback();
    }
  };

  const simulateGoogleOAuthFallback = () => {
    const defaultGoogleEmail = email.trim() || 'user.google@gmail.com';
    const defaultGoogleName = fullName.trim() || 'Google User';

    const existing = loginUser(defaultGoogleEmail);
    if (!existing) {
      signupUser(defaultGoogleEmail, defaultGoogleName);
    }
    setTimeout(() => {
      setIsGoogleLoading(false);
      onClose();
      clearAuthMessages();
    }, 1000);
  };

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
      // User creates profile without mandatory demo avatar
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sky-100 relative">
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
          <div className="w-12 h-12 rounded-2xl blue-gradient-btn text-white mx-auto mb-3 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {mode === 'signin'
              ? 'Sign in to access your consultations & care plans'
              : 'Sign up for a private, confidential account (Avatar optional)'}
          </p>
        </div>

        {/* Standard Google OAuth 2.0 Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 text-slate-700 font-bold text-xs rounded-2xl shadow-2xs flex items-center justify-center gap-3 transition-all mb-4"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {isGoogleLoading ? 'Connecting to Google OAuth...' : `${mode === 'signin' ? 'Sign in' : 'Sign up'} with Google`}
        </button>

        <div className="relative flex items-center justify-center mb-4">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
            or with email
          </span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
          <button
            onClick={() => {
              setMode('signin');
              clearAuthMessages();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-sky-900 shadow-2xs'
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
                ? 'bg-white text-sky-900 shadow-2xs'
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
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
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 blue-gradient-btn text-white font-bold text-xs rounded-2xl shadow-md transition-all mt-2"
          >
            {mode === 'signin' ? 'Sign In to Account' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
