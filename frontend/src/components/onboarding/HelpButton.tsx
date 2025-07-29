'use client';

import React, { useState } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import WelcomeModal from './WelcomeModal';
import { resetOnboardingState } from '@/services/onboardingService';

export default function HelpButton() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset onboarding state so it doesn't show automatically next time
    resetOnboardingState();
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="btn-secondary w-full flex items-center justify-center gap-3 py-3 text-base font-medium"
        aria-label="Help"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
        Help & Tutorial
      </button>

      {showModal && <WelcomeModal onClose={handleCloseModal} />}
    </>
  );
}
