'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AdminLoginView } from '@/components/views/AdminLoginView';
import { AdminView } from '@/components/views/AdminView';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';

function AdminPageContent() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<string>(user.role === 'admin' ? 'admin' : 'admin_login');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar
        setActiveTab={(tab) => {
          if (tab === 'home') window.location.href = '/';
          else setActiveTab(tab);
        }}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onOpenCounselorApply={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {user.role === 'admin' || activeTab === 'admin' ? (
          <AdminView />
        ) : (
          <AdminLoginView setActiveTab={setActiveTab} />
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AppProvider>
      <AdminPageContent />
    </AppProvider>
  );
}
