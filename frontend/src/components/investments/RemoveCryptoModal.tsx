'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '../ui/Modal';
import { removeCrypto } from '@/services/investmentService';

interface RemoveCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  cryptoSymbol: string;
  cryptoName: string;
  onRemove: () => void;
}

export default function RemoveCryptoModal({
  isOpen,
  onClose,
  accountId,
  cryptoSymbol,
  cryptoName,
  onRemove
}: RemoveCryptoModalProps) {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await removeCrypto(accountId, cryptoSymbol);
      
      toast.success(`Successfully removed ${cryptoSymbol} from your portfolio`);
      onRemove();
      onClose();
    } catch (error) {
      console.error('Error removing crypto:', error);
      setError('Failed to remove crypto. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Remove ${cryptoName} (${cryptoSymbol})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This will permanently remove {cryptoName} ({cryptoSymbol}) from your portfolio. 
                  This action cannot be undone. All transaction history will be preserved.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Reason for Removal (Optional)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="e.g., Transferred to another wallet, Sold on another platform, etc."
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Remove Crypto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
