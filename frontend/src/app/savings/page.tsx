'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Account, AccountType } from '@/types/account';
import { getAccounts } from '@/services/accountService';
import SavingsOverview from '@/components/savings/SavingsOverview';
import SavingsGoals from '@/components/savings/SavingsGoals';
import SavingsPredictions from '@/components/savings/SavingsPredictions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SavingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savingsAccounts, setSavingsAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavingsAccounts = async () => {
      if (status === 'authenticated') {
        try {
          setIsLoading(true);
          const accounts = await getAccounts();
          // Filter only savings accounts
          const filteredAccounts = accounts.filter(account => account.type === AccountType.SAVINGS);
          setSavingsAccounts(filteredAccounts as Account[]);
        } catch (error) {
          console.error('Error fetching savings accounts:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSavingsAccounts();
  }, [status]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Savings Management</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <SavingsOverview accounts={savingsAccounts} />
              </div>
              <div>
                <SavingsGoals accounts={savingsAccounts} />
              </div>
            </div>
            
            <div className="mt-8">
              <SavingsPredictions accounts={savingsAccounts} />
            </div>
            
            {savingsAccounts.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-lg mb-4">You don't have any savings accounts yet.</p>
                <button
                  onClick={() => router.push('/accounts?type=SAVINGS')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Create a Savings Account
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
