'use client';

import React, { useState } from 'react';
import { InvestmentAccountType } from '@/types/investment';
import { createInvestmentAccount } from '@/services/investmentService';
import { handleNumberInputChange } from '@/utils/inputHelpers';
import Modal from '../ui/Modal';

interface AddInvestmentAccountModalProps {
  onClose: () => void;
  onAccountAdded: () => void;
}

const AddInvestmentAccountModal: React.FC<AddInvestmentAccountModalProps> = ({
  onClose,
  onAccountAdded,
}) => {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<InvestmentAccountType>(InvestmentAccountType.BROKERAGE);
  const [cash, setCash] = useState(0);
  // Separate state for cash input to preserve string format during typing
  const [cashInput, setCashInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate inputs
      if (!name.trim()) {
        throw new Error('Account name is required');
      }
      
      if (!institution.trim()) {
        throw new Error('Institution name is required');
      }
      
      // Create new investment account
      await createInvestmentAccount({
        name,
        institution,
        type,
        cash,
        stocks: [],
        transactions: [],
      });
      
      onAccountAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to create investment account');
      console.error('Error creating investment account:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format account type for display
  const formatAccountType = (type: InvestmentAccountType): string => {
    switch (type) {
      case InvestmentAccountType.BROKERAGE:
        return 'Brokerage';
      case InvestmentAccountType.RETIREMENT_401K:
        return '401(k)';
      case InvestmentAccountType.ROTH_IRA:
        return 'Roth IRA';
      case InvestmentAccountType.TRADITIONAL_IRA:
        return 'Traditional IRA';
      case InvestmentAccountType.EDUCATION_529:
        return '529 Plan';
      case InvestmentAccountType.HSA:
        return 'HSA';
      case InvestmentAccountType.OTHER:
        return 'Other';
      default:
        return type;
    }
  };

  return (
    <Modal title="Add Investment Account" onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Account Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Fidelity Brokerage"
            required
          />
        </div>
        
        <div>
          <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
            Institution
          </label>
          <input
            type="text"
            id="institution"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Fidelity, Vanguard, Schwab"
            required
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Account Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as InvestmentAccountType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {Object.values(InvestmentAccountType).map((accountType) => (
              <option key={accountType} value={accountType}>
                {formatAccountType(accountType)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="cash" className="block text-sm font-medium text-gray-700">
            Initial Cash Balance ($)
          </label>
          <input
            type="text"
            id="cash"
            value={cashInput}
            onChange={(e) => {
              const value = e.target.value;
              
              // Allow empty input, single decimal point, or valid numbers (including leading zeros)
              if (value === '' || value === '.' || value === '0' || value === '0.' || !isNaN(parseFloat(value))) {
                setCashInput(value);
                
                // Update the actual cash value with the numeric value when appropriate
                if (value === '' || value === '.') {
                  setCash(0);
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    setCash(numValue);
                  }
                }
              }
            }}
            pattern="[0-9]*\.?[0-9]*"
            inputMode="decimal"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="0.00"
          />
          <p className="mt-1 text-xs text-gray-500">
            Cash balance in the account (uninvested funds)
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddInvestmentAccountModal;
