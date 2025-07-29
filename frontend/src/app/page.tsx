'use client';

import React, { useState, useEffect } from 'react';
import Overview from '@/components/Overview';
import Transactions from '@/components/Transactions';
import Accounts from '@/components/Accounts';
import Categories from '@/components/Categories';
import Settings from '@/components/Settings';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import WelcomeModal from '@/components/onboarding/WelcomeModal';
import { hasCompletedOnboarding, markOnboardingCompleted } from '@/services/onboardingService';

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if the user has completed onboarding
    const hasCompleted = hasCompletedOnboarding();
    if (!hasCompleted) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    markOnboardingCompleted();
  };

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col p-8">
        <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
        
        <div className="space-y-8">
          <Overview />
          <Transactions />
          <Accounts />
          <Categories />
          <Settings />
        </div>

        {showWelcomeModal && (
          <WelcomeModal onClose={handleCloseWelcomeModal} />
        )}
      </main>
    </ProtectedRoute>
  );
}
