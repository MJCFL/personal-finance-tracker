"use client";

import React, { useState } from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    id: 'transaction',
    label: 'Add Transaction',
    icon: '+',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'budget',
    label: 'New Budget',
    icon: '₿',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'asset',
    label: 'Add Asset',
    icon: '⭐',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
];

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Quick action buttons */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-2">
            {actions.map((action) => (
              <button
                key={action.id}
                className={`${action.color} text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transform transition-transform hover:scale-110`}
                onClick={() => {
                  setIsOpen(false);
                  // Handle action click
                }}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}

        {/* Main toggle button */}
        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transform transition-transform ${
            isOpen ? 'rotate-45' : ''
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-2xl">+</span>
        </button>
      </div>

      {/* Action labels */}
      {isOpen && (
        <div className="absolute bottom-16 right-20 space-y-7 mt-2">
          {actions.map((action, index) => (
            <div
              key={action.id}
              className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-md shadow"
              style={{ marginBottom: index === actions.length - 1 ? '0' : '1.75rem' }}
            >
              {action.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
