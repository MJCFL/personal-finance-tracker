'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import TransactionSummary from '@/components/transactions/TransactionSummary';
import CategoryBreakdown from '@/components/transactions/CategoryBreakdown';
import TransactionList from '@/components/transactions/TransactionList';
import { getTransactions, TransactionData } from '@/services/transactionService';
import { getAccounts } from '@/services/accountService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorMessage from '@/components/ui/ErrorMessage';
import AddTransactionModal from '@/components/transactions/AddTransactionModal';

// Category and icon mappings for UI display
const categoryColors = {
  Housing: '#22c55e',
  Transportation: '#3b82f6',
  Food: '#f59e0b',
  Entertainment: '#8b5cf6',
  Healthcare: '#ef4444',
  Education: '#10b981',
  Personal: '#6b7280',
  Utilities: '#ec4899',
  Insurance: '#14b8a6',
  Savings: '#f97316',
  Income: '#84cc16',
  Other: '#6b7280',
};

const categoryIcons = {
  Housing: '🏠',
  Transportation: '🚗',
  Food: '🍽️',
  Entertainment: '🎮',
  Healthcare: '🏥',
  Education: '📚',
  Personal: '👤',
  Utilities: '💡',
  Insurance: '🛡️',
  Savings: '💰',
  Income: '💵',
  Other: '📦',
};





export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsPageContent />
    </ProtectedRoute>
  );
}

function TransactionsPageContent() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBank, setSelectedBank] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Fetch transactions and accounts data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch transactions with filters
        const filters: any = {};
        if (selectedCategory !== 'all') filters.category = selectedCategory;
        if (selectedBank !== 'all') filters.accountId = selectedBank;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        
        const transactionResponse = await getTransactions(filters);
        setTransactions(transactionResponse.transactions);
        
        // Fetch accounts for filtering
        const accountsData = await getAccounts();
        setAccounts(accountsData);
        
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load transactions');
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [selectedCategory, selectedBank, startDate, endDate]);

  // Get unique categories and banks for filtering
  const categories = ['all', ...new Set(transactions.map(t => t.category))];
  const banks = ['all', ...new Set(accounts.map(a => a.id))];
  
  // Map account IDs to names for display
  const accountMap = accounts.reduce((map, account) => {
    map[account.id] = account.name;
    return map;
  }, {} as Record<string, string>);

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => {
    return transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate statistics
  const stats = {
    income: filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    expenses: filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    netIncome: filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) - 
      filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    monthlyChange: 0, // Will calculate if we have previous month data
  };

  // Calculate category breakdown for expenses
  const categoryBreakdown = Object.entries(
    filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, amount]) => ({
    name,
    amount,
    percentage: stats.expenses > 0 ? (amount / stats.expenses) * 100 : 0,
    icon: categoryIcons[name as keyof typeof categoryIcons] || '📦',
    color: categoryColors[name as keyof typeof categoryColors] || '#6b7280',
    change: 0, // Would need historical data to calculate real change
  }));
  
  // Handle transaction refresh after adding/editing
  const handleTransactionChange = async () => {
    try {
      setIsLoading(true);
      const transactionResponse = await getTransactions();
      setTransactions(transactionResponse.transactions);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh transactions');
      setIsLoading(false);
    }
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
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
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors"
            >
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
                    {banks.map(bankId => (
                      <option key={bankId} value={bankId}>
                        {bankId === 'all' ? 'All Accounts' : accountMap[bankId] || bankId}
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
            <TransactionList 
              transactions={filteredTransactions} 
              isLoading={isLoading} 
              accountMap={accountMap} 
              onTransactionChange={handleTransactionChange}
            />
          </div>
          <div className="lg:col-span-1">
            <CategoryBreakdown
              categories={categoryBreakdown}
              totalSpent={stats.expenses}
            />
          </div>
        </div>
      </div>
      
      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal 
          onClose={() => setShowAddModal(false)}
          onTransactionAdded={handleTransactionChange}
          accounts={accounts}
        />
      )}
    </div>
  );
}
