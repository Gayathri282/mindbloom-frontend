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
import { DoctorPortalView } from '@/components/views/DoctorPortalView';

function MindBloomApp() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Auto-switch tab based on user role when switching demo user via Auth modal
  useEffect(() => {
    if (user.role === 'therapist' && activeTab !== 'video_call' && activeTab !== 'chat' && activeTab !== 'careplan') {
      setActiveTab('doctor_portal');
    } else if (user.role === 'admin' && activeTab !== 'chat') {
      setActiveTab('admin');
    } else if (user.role === 'patient' && activeTab === 'doctor_portal') {
      setActiveTab('home');
    }
  }, [user.role]);

  const handleIncomingCallAccept = () => {
    setActiveTab('video_call');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F8] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Header Bar */}
      <Navbar
        setActiveTab={setActiveTab}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Doctor Initiated Incoming Call Alert Modal */}
      <IncomingCallModal onAccept={handleIncomingCallAccept} />

      {/* Auth & Account Switcher Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Main View Shell Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {activeTab === 'doctor_portal' && <DoctorPortalView setActiveTab={setActiveTab} />}
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
        {activeTab === 'booking' && <BookingView setActiveTab={setActiveTab} />}
        {activeTab === 'video_call' && <VideoCallView />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'careplan' && <CarePlanView />}
        {activeTab === 'mindfulness' && <MindfulnessView />}
        {activeTab === 'community' && <CommunityView />}
        {activeTab === 'admin' && <AdminView />}
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
