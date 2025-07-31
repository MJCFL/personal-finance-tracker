"use client";

import React, { useState, useEffect } from 'react';
import { getTransactions, TransactionData } from '@/services/transactionService';
import { BudgetCategory } from '@/types/budget';
import { TransactionType } from '@/types/commonTypes';

export default function RecentTransactionsCard() {
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
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading transactions...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent transactions found</p>
        ) : transactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-lg ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '↑' : '↓'}
                </span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <span className={`font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
