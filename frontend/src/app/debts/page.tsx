'use client';

import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '@/types/account';
import { getAccounts, AccountData } from '@/services/accountService';
import DebtList from '@/components/debts/DebtList';
import DebtAnalytics from '@/components/debts/DebtAnalytics';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DebtsPage() {
  const [debts, setDebts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<AccountData | null>(null);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const accounts = await getAccounts();
      
      // Filter accounts that are considered debts (negative impact on net worth)
      const debtAccounts = accounts.filter(account => 
        [AccountType.CREDIT_CARD, AccountType.LOAN, AccountType.MORTGAGE].includes(account.type)
      );
      
      setDebts(debtAccounts);
      
      // Select the first debt by default if available
      if (debtAccounts.length > 0 && !selectedDebt) {
        setSelectedDebt(debtAccounts[0]);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch debt accounts');
      setLoading(false);
    }
  };

  const handleSelectDebt = (debt: AccountData) => {
    setSelectedDebt(debt);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Debt Management</h1>
        
        {error && <ErrorMessage message={error} />}
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DebtList 
                debts={debts} 
                selectedDebt={selectedDebt}
                onSelectDebt={handleSelectDebt}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedDebt ? (
                <DebtAnalytics debt={selectedDebt} />
              ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">Select a debt to view analytics</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
