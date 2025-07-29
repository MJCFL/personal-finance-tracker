'use client';

import React from 'react';

interface ErrorMessageProps {
  message: string | null;
  className?: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ 
  message, 
  className = '', 
  onDismiss 
}: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className={`bg-red-900 text-red-200 p-4 rounded-md mb-4 flex justify-between items-center ${className}`}>
      <p>{message}</p>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="ml-4 text-red-200 hover:text-white"
          aria-label="Dismiss error"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
