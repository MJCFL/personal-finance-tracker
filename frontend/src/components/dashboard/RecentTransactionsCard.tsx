"use client";

import React from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-04-08',
    description: 'Monthly Salary',
    amount: 5000,
    category: 'Income',
    type: 'income'
  },
  {
    id: '2',
    date: '2025-04-07',
    description: 'Grocery Shopping',
    amount: 150.75,
    category: 'Food',
    type: 'expense'
  },
  {
    id: '3',
    date: '2025-04-07',
    description: 'Netflix Subscription',
    amount: 15.99,
    category: 'Entertainment',
    type: 'expense'
  },
  {
    id: '4',
    date: '2025-04-06',
    description: 'Gas Station',
    amount: 45.50,
    category: 'Transportation',
    type: 'expense'
  },
  {
    id: '5',
    date: '2025-04-06',
    description: 'Freelance Payment',
    amount: 750,
    category: 'Income',
    type: 'income'
  }
];

export default function RecentTransactionsCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>

      <div className="space-y-4">
        {mockTransactions.map((transaction) => (
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
