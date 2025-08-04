'use client';

import React, { useState } from 'react';
import { updateCashBalance, recordCashTransaction } from '@/services/investmentService';
import { TransactionType } from '@/types/investment';

interface CashManagementProps {
  accountId: string;
  currentCash: number;
  onCashUpdated: () => void;
}

const CashManagement: React.FC<CashManagementProps> = ({
  accountId,
  currentCash,
  onCashUpdated,
}) => {
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle deposit
  const handleDeposit = async () => {
    try {
      setError(null);
      setSuccess(null);
      setIsDepositing(true);
      
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Update cash balance
      await updateCashBalance(accountId, currentCash + amountNum);
      
      // Record transaction
      await recordCashTransaction(accountId, {
        type: TransactionType.DEPOSIT,
        amount: amountNum,
        date: new Date(),
      });
      
      setAmount('');
      setSuccess(`Successfully deposited $${amountNum.toFixed(2)}`);
      onCashUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to deposit cash');
      console.error('Error depositing cash:', err);
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async () => {
    try {
      setError(null);
      setSuccess(null);
      setIsWithdrawing(true);
      
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (amountNum > currentCash) {
        throw new Error('Insufficient cash balance');
      }
      
      // Update cash balance
      await updateCashBalance(accountId, currentCash - amountNum);
      
      // Record transaction
      await recordCashTransaction(accountId, {
        type: TransactionType.WITHDRAWAL,
        amount: amountNum,
        date: new Date(),
      });
      
      setAmount('');
      setSuccess(`Successfully withdrew $${amountNum.toFixed(2)}`);
      onCashUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw cash');
      console.error('Error withdrawing cash:', err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold mb-2">Cash Balance</h3>
        <p className="text-3xl font-bold text-blue-600">
          ${currentCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Uninvested cash available in this account
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Manage Cash</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount ($)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleDeposit}
            disabled={isDepositing || amount === ''}
            className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isDepositing || amount === '' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isDepositing ? 'Depositing...' : 'Deposit'}
          </button>
          
          <button
            onClick={handleWithdrawal}
            disabled={isWithdrawing || amount === '' || parseFloat(amount) > currentCash}
            className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              isWithdrawing || amount === '' || parseFloat(amount || '0') > currentCash ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashManagement;
