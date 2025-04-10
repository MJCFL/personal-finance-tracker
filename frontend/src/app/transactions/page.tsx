'use client';

import React from 'react';
import TransactionSummary from '@/components/transactions/TransactionSummary';
import CategoryBreakdown from '@/components/transactions/CategoryBreakdown';
import TransactionList from '@/components/transactions/TransactionList';
import { Transaction } from '@/types/transaction';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-04-08',
    description: 'Monthly Salary',
    amount: 5000,
    category: 'Income',
    type: 'income',
    source: 'Employer Inc.',
    account: 'Main Account',
  },
  {
    id: '2',
    date: '2025-04-07',
    description: 'Grocery Shopping',
    amount: -150.75,
    category: 'Food',
    type: 'expense',
    source: 'Whole Foods',
    account: 'Credit Card',
  },
  // Add more mock transactions as needed
];

const mockCategories = [
  {
    name: 'Food',
    amount: 850.25,
    percentage: 35,
    icon: '🍔',
    color: '#22c55e',
    change: -5.2,
  },
  {
    name: 'Transportation',
    amount: 450.50,
    percentage: 18,
    icon: '🚗',
    color: '#3b82f6',
    change: 2.8,
  },
  {
    name: 'Entertainment',
    amount: 320.75,
    percentage: 13,
    icon: '🎮',
    color: '#a855f7',
    change: 1.5,
  },
  {
    name: 'Shopping',
    amount: 280.30,
    percentage: 11,
    icon: '🛍️',
    color: '#f43f5e',
    change: -3.1,
  },
  {
    name: 'Utilities',
    amount: 245.80,
    percentage: 10,
    icon: '💡',
    color: '#f59e0b',
    change: 0.8,
  },
];

const categoryColors = {
  Food: '#22c55e',
  Shopping: '#3b82f6',
  Transportation: '#f59e0b',
  Entertainment: '#8b5cf6',
  Bills: '#ef4444',
  Income: '#10b981',
  Other: '#6b7280',
};

const categoryIcons = {
  Food: '🍽️',
  Shopping: '🛍️',
  Transportation: '🚗',
  Entertainment: '🎮',
  Bills: '📄',
  Income: '💰',
  Other: '📦',
};

const mockAccounts = [
  { id: '1', name: 'Main Checking', institution: 'Big Bank', balance: 5000 },
  { id: '2', name: 'Savings', institution: 'Small Bank', balance: 10000 },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedBank, setSelectedBank] = React.useState('all');
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  // Get unique categories and banks
  const categories = ['all', ...new Set(mockTransactions.map(t => t.category))];
  const banks = ['all', ...new Set(mockAccounts.map(a => a.institution))];

  // Filter transactions based on all criteria
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    const matchesBank = selectedBank === 'all' || transaction.account?.includes(selectedBank);
    
    // Date filtering
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!startDate || transactionDate >= startDate) && 
                           (!endDate || transactionDate <= endDate);

    return matchesSearch && matchesCategory && matchesBank && matchesDateRange;
  });

  // Calculate statistics
  const stats = {
    income: filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    expenses: Math.abs(filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)),
    netIncome: filteredTransactions
      .reduce((sum, t) => sum + t.amount, 0),
    monthlyChange: 250.75, // Mock monthly change
  };

  // Calculate category breakdown
  const categoryBreakdown = Object.entries(
    filteredTransactions
      .filter(t => t.amount < 0) // Only include expenses
      .reduce((acc, t) => {
        if (t.category !== 'Income') {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        }
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, amount]) => ({
    name,
    amount,
    percentage: (amount / stats.expenses) * 100,
    icon: categoryIcons[name as keyof typeof categoryIcons] || '📦',
    color: categoryColors[name as keyof typeof categoryColors] || '#6b7280',
    change: Math.random() * 20 - 10, // Mock change percentage
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <p className="text-gray-400 text-sm mt-1">
              Track and manage your financial activity
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-gray-800 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors">
              Export
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors">
              Add Transaction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TransactionSummary
              income={stats.income}
              expenses={stats.expenses}
              netIncome={stats.netIncome}
              monthlyChange={stats.monthlyChange}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Quick Filters</h2>
                <button className="text-sm text-gray-400 hover:text-white">
                  Clear All
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors">
                    This Month
                  </button>
                  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded-lg hover:bg-gray-700 transition-colors">
                    Last Month
                  </button>
                  <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded-lg hover:bg-gray-700 transition-colors">
                    Last 3 Months
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-sm rounded-lg hover:bg-emerald-500/30 transition-colors">
                    Income
                  </button>
                  <button className="px-3 py-1.5 bg-rose-500/20 text-rose-400 text-sm rounded-lg hover:bg-rose-500/30 transition-colors">
                    Expenses
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="w-full px-4 py-2 bg-gray-800 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="w-full px-4 py-2 bg-gray-800 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    {banks.map(bank => (
                      <option key={bank} value={bank}>
                        {bank === 'all' ? 'All Banks' : bank}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4">
                  <input
                    type="date"
                    value={startDate ? startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setStartDate(e.target.valueAsDate)}
                    className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={endDate ? endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEndDate(e.target.valueAsDate)}
                    className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TransactionList transactions={filteredTransactions} />
          </div>
          <div className="lg:col-span-1">
            <CategoryBreakdown
              categories={categoryBreakdown}
              totalSpent={stats.expenses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
