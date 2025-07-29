'use client';

import React, { useEffect, useState } from 'react';

interface SuccessMessageProps {
  message: string | null;
  className?: string;
  duration?: number; // Auto-dismiss duration in ms (0 means no auto-dismiss)
  onDismiss?: () => void;
}

export default function SuccessMessage({ 
  message, 
  className = '', 
  duration = 5000,
  onDismiss 
}: SuccessMessageProps) {
  const [visible, setVisible] = useState(Boolean(message));
  
  useEffect(() => {
    setVisible(Boolean(message));
    
    // Auto-dismiss after duration if specified
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [message, duration, onDismiss]);
  
  if (!message || !visible) return null;
  
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };
  
  return (
    <div className={`bg-green-900 text-green-200 p-4 rounded-md mb-4 flex justify-between items-center ${className}`}>
      <p>{message}</p>
      <button 
        onClick={handleDismiss}
        className="ml-4 text-green-200 hover:text-white"
        aria-label="Dismiss success message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
