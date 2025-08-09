'use client';

import React, { useState } from 'react';
import { SavingsBucket, Account } from '@/types/account';
import { updateAccount } from '@/services/accountService';
import { v4 as uuidv4 } from 'uuid';
import { FaTrash, FaPiggyBank, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface SavingsBucketsProps {
  account: Account;
  onUpdate: (updatedAccount: Account) => void;
}

export default function SavingsBuckets({ account, onUpdate }: SavingsBucketsProps) {
  const [buckets, setBuckets] = useState<SavingsBucket[]>(account.buckets || []);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketAmount, setNewBucketAmount] = useState<number | ''>('');
  const [newBucketGoal, setNewBucketGoal] = useState<number | ''>('');
  const [isEmergencyFund, setIsEmergencyFund] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total allocated in buckets
  const totalAllocated = buckets.reduce((sum, bucket) => sum + bucket.amount, 0);
  
  // Calculate unallocated amount
  const unallocatedAmount = account.balance - totalAllocated;

  const handleAddBucket = async () => {
    if (!newBucketName) {
      toast.error('Please enter a bucket name');
      return;
    }

    if (newBucketAmount === '' || Number(newBucketAmount) <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (Number(newBucketAmount) > unallocatedAmount) {
      toast.error(`Cannot allocate more than the unallocated amount (${unallocatedAmount.toFixed(2)})`);
      return;
    }

    // Create new bucket
    const newBucket: SavingsBucket = {
      id: uuidv4(),
      name: newBucketName,
      amount: Number(newBucketAmount),
      goal: newBucketGoal !== '' ? Number(newBucketGoal) : undefined,
      isEmergencyFund,
      notes: ''
    };

    // Check if we already have an emergency fund bucket
    if (isEmergencyFund && buckets.some(b => b.isEmergencyFund)) {
      toast.error('You can only have one emergency fund bucket');
      return;
    }

    const updatedBuckets = [...buckets, newBucket];
    
    try {
      setIsLoading(true);
      
      // Update account with new buckets
      const updatedAccount = {
        ...account,
        buckets: updatedBuckets
      };
      
      await updateAccount(updatedAccount.id, updatedAccount);
      
      // Update local state
      setBuckets(updatedBuckets);
      onUpdate(updatedAccount);
      
      // Reset form
      setNewBucketName('');
      setNewBucketAmount('');
      setNewBucketGoal('');
      setIsEmergencyFund(false);
      
      toast.success('Bucket added successfully');
    } catch (error) {
      console.error('Error adding bucket:', error);
      toast.error('Failed to add bucket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBucket = async (bucketId: string, field: keyof SavingsBucket, value: any) => {
    try {
      setIsLoading(true);
      
      const updatedBuckets = buckets.map(bucket => {
        if (bucket.id === bucketId) {
          return { ...bucket, [field]: value };
        }
        return bucket;
      });
      
      // Update account with updated buckets
      const updatedAccount = {
        ...account,
        buckets: updatedBuckets
      };
      
      await updateAccount(updatedAccount.id, updatedAccount);
      
      // Update local state
      setBuckets(updatedBuckets);
      onUpdate(updatedAccount);
      
      toast.success('Bucket updated successfully');
    } catch (error) {
      console.error('Error updating bucket:', error);
      toast.error('Failed to update bucket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBucket = async (bucketId: string) => {
    try {
      setIsLoading(true);
      
      const updatedBuckets = buckets.filter(bucket => bucket.id !== bucketId);
      
      // Update account with updated buckets
      const updatedAccount = {
        ...account,
        buckets: updatedBuckets
      };
      
      await updateAccount(updatedAccount.id, updatedAccount);
      
      // Update local state
      setBuckets(updatedBuckets);
      onUpdate(updatedAccount);
      
      toast.success('Bucket deleted successfully');
    } catch (error) {
      console.error('Error deleting bucket:', error);
      toast.error('Failed to delete bucket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FaPiggyBank className="mr-2" /> Savings Buckets
      </h3>
      
      <div className="mb-6">
        <div key="balance-row" className="flex justify-between mb-2">
          <span>Total Balance:</span>
          <span className="font-semibold">${account.balance.toFixed(2)}</span>
        </div>
        <div key="allocated-row" className="flex justify-between mb-2">
          <span>Allocated in Buckets:</span>
          <span className="font-semibold">${totalAllocated.toFixed(2)}</span>
        </div>
        <div key="unallocated-row" className="flex justify-between mb-2">
          <span>Unallocated:</span>
          <span className={`font-semibold ${unallocatedAmount < 0 ? 'text-red-500' : ''}`}>
            ${unallocatedAmount.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Existing buckets */}
      {buckets.length > 0 ? (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Your Buckets</h4>
          <div className="space-y-3">
            {buckets.map(bucket => (
              <div 
                key={bucket.id} 
                className={`p-3 rounded-lg border ${bucket.isEmergencyFund ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {bucket.isEmergencyFund && <FaShieldAlt className="mr-2 text-blue-500" />}
                    <span className="font-medium">{bucket.name}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteBucket(bucket.id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={isLoading}
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div key={`amount-${bucket.id}`}>
                    <label className="block text-sm text-gray-600 dark:text-gray-400">Amount</label>
                    <input
                      type="number"
                      value={bucket.amount}
                      onChange={(e) => handleUpdateBucket(bucket.id, 'amount', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                  <div key={`goal-${bucket.id}`}>
                    <label className="block text-sm text-gray-600 dark:text-gray-400">Goal (optional)</label>
                    <input
                      type="number"
                      value={bucket.goal || ''}
                      onChange={(e) => handleUpdateBucket(bucket.id, 'goal', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {bucket.goal && (
                  <div key={`progress-${bucket.id}`} className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span key={`progress-label-${bucket.id}`}>Progress</span>
                      <span key={`progress-percent-${bucket.id}`}>{((bucket.amount / bucket.goal) * 100).toFixed(0)}%</span>
                    </div>
                    <div key={`progress-bar-bg-${bucket.id}`} className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        key={`progress-bar-fill-${bucket.id}`}
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (bucket.amount / bucket.goal) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No buckets created yet. Add your first bucket below.
        </div>
      )}
      
      {/* Add new bucket form */}
      <div className="border-t pt-4 dark:border-gray-700">
        <h4 className="font-medium mb-3">Add New Bucket</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div key="new-bucket-name">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Bucket Name</label>
            <input
              type="text"
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Vacation Fund"
              disabled={isLoading}
            />
          </div>
          <div key="new-bucket-amount">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Amount ($)</label>
            <input
              type="number"
              value={newBucketAmount}
              onChange={(e) => setNewBucketAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div key="new-bucket-goal">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Goal Amount (optional)</label>
            <input
              type="number"
              value={newBucketGoal}
              onChange={(e) => setNewBucketGoal(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>
          <div key="emergency-fund-checkbox" className="flex items-center h-full pt-6">
            <input
              type="checkbox"
              id="emergencyFund"
              checked={isEmergencyFund}
              onChange={(e) => setIsEmergencyFund(e.target.checked)}
              className="mr-2"
              disabled={isLoading || buckets.some(b => b.isEmergencyFund)}
            />
            <label htmlFor="emergencyFund" className="text-sm text-gray-600 dark:text-gray-400">
              This is my Emergency Fund
            </label>
          </div>
        </div>
        
        <button
          onClick={handleAddBucket}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Bucket'}
        </button>
      </div>
    </div>
  );
}
