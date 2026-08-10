'use client';

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { IncomingCallModal } from '@/components/IncomingCallModal';
import { AuthModal } from '@/components/AuthModal';

import { HomeView } from '@/components/views/HomeView';
import { BookingView } from '@/components/views/BookingView';
import { VideoCallView } from '@/components/views/VideoCallView';
import { ChatView } from '@/components/views/ChatView';
import { CarePlanView } from '@/components/views/CarePlanView';
import { MindfulnessView } from '@/components/views/MindfulnessView';
import { CommunityView } from '@/components/views/CommunityView';
import { AdminView } from '@/components/views/AdminView';
import { AdminLoginView } from '@/components/views/AdminLoginView';
import { DoctorPortalView } from '@/components/views/DoctorPortalView';

import { CounselorApplyModal } from '@/components/CounselorApplyModal';
import { CounselorStatusView } from '@/components/views/CounselorStatusView';
import { BookingConfirmationView } from '@/components/views/BookingConfirmationView';

function MindBloomApp() {
  const { user, submitCounselorApplication } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [counselorModalOpen, setCounselorModalOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('mindbloom_active_tab');
      if (savedTab) return savedTab;
    }
    if (user.role === 'admin') return 'admin';
    if (user.role === 'therapist' || user.role === 'counselor') return 'doctor_portal';
    return 'home';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindbloom_active_tab', activeTab);
    }
  }, [activeTab]);

  const handleIncomingCallAccept = () => {
    setActiveTab('video_call');
  };

  const isCounselorUnverified =
    (user.role === 'therapist' || user.role === 'counselor') &&
    user.status &&
    user.status !== 'approved';

  return (
    <div className="min-h-screen flex flex-col text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Header Bar */}
      <Navbar
        setActiveTab={setActiveTab}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Doctor Initiated Incoming Call Alert Modal */}
      <IncomingCallModal onAccept={handleIncomingCallAccept} />

      {/* Auth & Account Switcher Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onOpenCounselorApply={() => setCounselorModalOpen(true)}
      />

      {/* Prospective Counselor Sign-Up Modal */}
      <CounselorApplyModal
        isOpen={counselorModalOpen}
        onClose={() => setCounselorModalOpen(false)}
        onSubmitApplication={submitCounselorApplication}
      />

      {/* Main View Shell Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {activeTab === 'doctor_portal' &&
          (isCounselorUnverified ? (
            <CounselorStatusView setActiveTab={setActiveTab} />
          ) : (
            <DoctorPortalView setActiveTab={setActiveTab} />
          ))}
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
        {activeTab === 'booking' && <BookingView setActiveTab={setActiveTab} />}
        {activeTab === 'booking_confirmation' && (
          <BookingConfirmationView appointmentId={null} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'video_call' && <VideoCallView />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'careplan' && <CarePlanView />}
        {activeTab === 'mindfulness' && <MindfulnessView />}
        {activeTab === 'community' && <CommunityView />}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'admin_login' && <AdminLoginView setActiveTab={setActiveTab} />}
      </main>

      {/* Sticky Bottom Navigation Bar (App-Shell standard across desktop & mobile) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MindBloomApp />
    </AppProvider>
  );
}
