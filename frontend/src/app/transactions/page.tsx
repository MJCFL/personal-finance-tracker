'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import TransactionList from '@/components/transactions/TransactionList';
import TransactionSummary from '@/components/transactions/TransactionSummary';
import CategoryBreakdown from '@/components/transactions/CategoryBreakdown';
import { Transaction } from '@/types/transaction';

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

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-04-08',
    description: 'Monthly Salary',
    amount: 5000,
    category: 'Income',
    type: 'income',
    source: 'Employer Inc.',
    notes: 'Regular monthly salary',
    account: 'Main Checking'
  },
  {
    id: '2',
    date: '2025-04-07',
    description: 'Grocery Shopping',
    amount: 150.75,
    category: 'Food',
    type: 'expense',
    source: 'Whole Foods',
    notes: 'Weekly groceries',
    account: 'Main Checking'
  },
];

const mockAccounts = [
  { id: '1', name: 'Main Checking', institution: 'Big Bank', balance: 5000 },
  { id: '2', name: 'Savings', institution: 'Small Bank', balance: 10000 },
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBank, setSelectedBank] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
    totalIncome: filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(filteredTransactions
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
    percentage: (amount / stats.totalExpenses) * 100,
    icon: categoryIcons[name as keyof typeof categoryIcons] || '📦',
    color: categoryColors[name as keyof typeof categoryColors] || '#6b7280',
    change: Math.random() * 20 - 10, // Mock change percentage
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add Transaction
        </button>
      </div>

      {/* Transaction Summary */}
      <TransactionSummary
        totalIncome={stats.totalIncome}
        totalExpenses={stats.totalExpenses}
        netIncome={stats.netIncome}
        monthlyChange={stats.monthlyChange}
      />

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700" onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedBank('all');
            setStartDate(null);
            setEndDate(null);
          }}>
            Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-sm"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                placeholderText="Start date"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                placeholderText="End date"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2">
          <TransactionList transactions={filteredTransactions} />
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-1">
          <CategoryBreakdown
            categories={categoryBreakdown}
            totalSpent={stats.totalExpenses}
          />
        </div>
      </div>
    </div>
  );
}
