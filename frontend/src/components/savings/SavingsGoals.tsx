'use client';

import React from 'react';
import { Account, SavingsBucket } from '@/types/account';
import { FaFlag, FaShieldAlt } from 'react-icons/fa';

interface SavingsGoalsProps {
  accounts: Account[];
}

export default function SavingsGoals({ accounts }: SavingsGoalsProps) {
  // Extract all buckets with goals from all accounts
  const bucketsWithGoals = accounts.flatMap(account => 
    (account.buckets || [])
      .filter(bucket => bucket.goal !== undefined)
      .map(bucket => ({
        ...bucket,
        accountName: account.name,
        accountId: account.id
      }))
  );

  // Find emergency fund bucket if it exists
  const emergencyFund = accounts.flatMap(account => 
    (account.buckets || []).filter(bucket => bucket.isEmergencyFund)
  )[0];

  // Sort buckets by progress percentage (descending)
  const sortedBuckets = [...bucketsWithGoals].sort((a, b) => {
    const progressA = a.goal ? (a.amount / a.goal) : 0;
    const progressB = b.goal ? (b.amount / b.goal) : 0;
    return progressB - progressA;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
      <h2 className="text-xl font-bold flex items-center mb-6">
        <FaFlag className="mr-2" /> Savings Goals
      </h2>

      {bucketsWithGoals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No savings goals found.</p>
          <p className="mt-2">Add goals to your savings buckets to track your progress.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Emergency Fund (if exists) */}
          {emergencyFund && emergencyFund.goal && (
            <div className="p-4 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FaShieldAlt className="mr-2 text-blue-500" />
                  <span className="font-medium">Emergency Fund</span>
                </div>
                <span className="text-sm font-medium">
                  {((emergencyFund.amount / emergencyFund.goal) * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (emergencyFund.amount / emergencyFund.goal) * 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>${emergencyFund.amount.toFixed(2)}</span>
                <span>Goal: ${emergencyFund.goal.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {/* Other Goals */}
          {sortedBuckets
            .filter(bucket => !bucket.isEmergencyFund)
            .map((bucket) => {
              const progress = bucket.goal ? (bucket.amount / bucket.goal) * 100 : 0;
              
              return (
                <div key={bucket.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between mb-1">
                    <div>
                      <h4 className="font-medium">{bucket.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{bucket.accountName}</p>
                    </div>
                    <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mb-2">
                    <div 
                      className={`h-2 rounded-full ${
                        progress >= 100 
                          ? 'bg-green-500' 
                          : progress >= 75 
                            ? 'bg-blue-500' 
                            : progress >= 50 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>${bucket.amount.toFixed(2)}</span>
                    <span>Goal: ${bucket.goal?.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
