'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Your Personal Finance Tracker',
      content: (
        <div className="space-y-4">
          <p>
            Hello{session?.user?.name ? ` ${session.user.name}` : ''}! Welcome to your personal finance tracker.
            This app helps you manage your assets and track your financial progress.
          </p>
          <p>
            Let's take a quick tour to help you get started.
          </p>
        </div>
      ),
    },
    {
      title: 'Track Your Assets',
      content: (
        <div className="space-y-4">
          <p>
            The Assets page allows you to add and manage different types of assets:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Stocks with real-time price updates</li>
            <li>Real estate properties</li>
            <li>Cash and bank accounts</li>
            <li>Cryptocurrencies</li>
            <li>And more!</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Dashboard Overview',
      content: (
        <div className="space-y-4">
          <p>
            The Dashboard gives you a complete overview of your financial status:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Total asset value</li>
            <li>Asset allocation</li>
            <li>Recent transactions</li>
            <li>Financial insights</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Your Data is Secure',
      content: (
        <div className="space-y-4">
          <p>
            Your financial data is private and secure:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Google authentication ensures only you can access your data</li>
            <li>All data is encrypted and stored securely</li>
            <li>You can delete your account and data at any time</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Ready to Start?',
      content: (
        <div className="space-y-4">
          <p>
            You're all set to start tracking your finances!
          </p>
          <p>
            Begin by adding your first asset on the Assets page, or explore the dashboard to see sample data.
          </p>
          <p>
            If you need help at any time, click the Help icon in the sidebar.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{steps[currentStep].title}</h2>
          <div className="text-gray-300">{steps[currentStep].content}</div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
              >
                Skip Tour
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full mx-1 ${
                index === currentStep ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
