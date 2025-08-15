"use client";

import React, { useState, useEffect } from 'react';
import { getTransactions, TransactionData } from '@/services/transactionService';
import { BudgetCategory } from '@/types/budget';
import { TransactionType } from '@/types/commonTypes';
import { useRouter } from 'next/navigation';

// Format date as MM/DD/YYYY with proper timezone handling
function formatDate(dateString: string | Date): string {
  // Parse the date and add one day to compensate for timezone shift
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1); // Add one day to fix the timezone issue
  
  // Get the date components
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Format as MM/DD/YYYY
  return `${month}/${day}/${year}`;
}

export default function RecentTransactionsCard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const response = await getTransactions({ limit: 5 });
        setTransactions(response.transactions);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load recent transactions');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
        <button 
          onClick={() => router.push('/transactions')} 
          className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-xs text-gray-500 text-center py-2">Loading transactions...</p>
        ) : error ? (
          <p className="text-xs text-red-500 text-center py-2">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-2">No recent transactions found</p>
        ) : transactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                transaction.type === TransactionType.INCOME ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-xs ${
                  transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === TransactionType.INCOME ? '↑' : '↓'}
                </span>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-900">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>

            <span className={`text-xs font-medium ${
              transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === TransactionType.INCOME ? '+' : '-'}${transaction.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
