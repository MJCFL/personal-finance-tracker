'use client';

import React, { useState } from 'react';
import { Account } from '@/types/account';
import { FaPiggyBank, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface SavingsOverviewProps {
  accounts: Account[];
}

export default function SavingsOverview({ accounts }: SavingsOverviewProps) {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(
    accounts.length > 0 ? accounts[0].id : null
  );

  // Calculate total savings across all accounts
  const totalSavings = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Calculate total allocated in buckets across all accounts
  const totalAllocated = accounts.reduce((sum, account) => {
    const accountBuckets = account.buckets || [];
    return sum + accountBuckets.reduce((bucketSum, bucket) => bucketSum + bucket.amount, 0);
  }, 0);
  
  // Calculate total unallocated
  const totalUnallocated = totalSavings - totalAllocated;

  // Get the selected account
  const currentAccount = accounts.find(account => account.id === selectedAccount);
  
  // Get buckets for the selected account
  const currentBuckets = currentAccount?.buckets || [];
  
  // Calculate total allocated in current account
  const currentAllocated = currentBuckets.reduce((sum, bucket) => sum + bucket.amount, 0);
  
  // Calculate unallocated in current account
  const currentUnallocated = currentAccount ? currentAccount.balance - currentAllocated : 0;

  // Summary card data
  const summaryCards = [
    {
      id: "total-savings",
      bgClass: "bg-blue-50 dark:bg-blue-900/20",
      label: "Total Savings",
      value: totalSavings
    },
    {
      id: "total-allocated",
      bgClass: "bg-green-50 dark:bg-green-900/20",
      label: "Allocated",
      value: totalAllocated
    },
    {
      id: "total-unallocated",
      bgClass: "bg-purple-50 dark:bg-purple-900/20",
      label: "Unallocated",
      value: totalUnallocated
    }
  ];

  // Account detail cards
  const accountDetailCards = [
    {
      id: "account-balance",
      label: "Balance",
      value: currentAccount?.balance || 0
    },
    {
      id: "account-unallocated",
      label: "Unallocated",
      value: currentUnallocated
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <FaPiggyBank className="mr-2" /> Savings Overview
        </h2>
        <button
          onClick={() => router.push('/accounts?type=SAVINGS')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
        >
          <FaPlus className="mr-1" /> Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No savings accounts found.</p>
          <p className="mt-2">Create a savings account to get started.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {summaryCards.map((card) => (
              <div key={card.id} className={`${card.bgClass} p-4 rounded-lg`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold">${card.value.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Account Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Account
            </label>
            <select
              value={selectedAccount || ''}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} (${account.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Account Details */}
          {currentAccount && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{currentAccount.name}</h3>
                <button
                  onClick={() => router.push(`/accounts/edit/${currentAccount.id}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Manage Buckets
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {accountDetailCards.map((card) => (
                  <div key={card.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
                    <p className="text-xl font-semibold">${card.value.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {/* Buckets List */}
              <div>
                <h4 className="font-medium mb-3">Savings Buckets</h4>
                {currentBuckets.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No buckets created for this account yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currentBuckets.map((bucket, index) => {
                      // Ensure bucket has an id
                      const bucketId = bucket.id || `bucket-${index}`;
                      const progressPercentage = bucket.goal 
                        ? Math.min(100, (bucket.amount / bucket.goal) * 100) 
                        : 0;
                        
                      return (
                        <div 
                          key={bucketId}
                          className={`p-3 rounded-lg border ${bucket.isEmergencyFund ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              {bucket.isEmergencyFund && <span className="mr-1">🛡️</span>}
                              <span className="font-medium">{bucket.name}</span>
                            </div>
                            <span className="text-sm">${bucket.amount.toFixed(2)}</span>
                          </div>
                          
                          {bucket.goal && (
                            <div className="mt-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{progressPercentage.toFixed(0)}% of ${bucket.goal.toFixed(2)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
