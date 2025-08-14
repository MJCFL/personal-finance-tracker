'use client';

import React, { useState } from 'react';
import { TransactionData, deleteTransaction } from '@/services/transactionService';
import { TransactionType } from '@/types/commonTypes';

interface TransactionListProps {
  transactions: TransactionData[];
  isLoading?: boolean;
  accountMap?: Record<string, string>;
  onTransactionChange?: () => void;
  onEdit?: (transaction: TransactionData) => void;
}

export default function TransactionList({ 
  transactions, 
  isLoading = false, 
  accountMap = {}, 
  onTransactionChange,
  onEdit
}: TransactionListProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const toggleTransaction = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedTransactions(prev =>
      prev.length === transactions.length
        ? []
        : transactions.map(t => t.id || '').filter(Boolean)
    );
  };

  // Handle transaction deletion
  const handleDelete = async (id: string) => {
    if (!id) return; // Skip if ID is undefined
    
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        if (onTransactionChange) {
          onTransactionChange();
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedTransactions.length} transactions?`)) {
      try {
        // Delete each selected transaction
        await Promise.all(selectedTransactions.map(id => deleteTransaction(id)));
        setSelectedTransactions([]);
        if (onTransactionChange) {
          onTransactionChange();
        }
      } catch (error) {
        console.error('Error deleting transactions:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--card)] rounded-3xl p-6 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-3xl p-6 flex flex-col justify-center items-center min-h-[300px]">
        <p className="text-[var(--text-secondary)] mb-4">No transactions found</p>
        <p className="text-[var(--text-secondary)] text-sm">Add a transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-3xl">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-offset-gray-900"
                checked={selectedTransactions.length === transactions.length}
                onChange={toggleAll}
              />
              <span className="ml-2 text-sm text-gray-400">
                {selectedTransactions.length} selected
              </span>
            </label>
            {selectedTransactions.length > 0 && (
              <button 
                className="text-sm text-rose-400 hover:text-rose-300"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={viewMode === 'list' ? 'divide-y divide-gray-800' : 'p-6 grid grid-cols-2 gap-4'}>
        {transactions.map((transaction) => (
          <div
            key={transaction.id || Math.random().toString()}
            className={`group ${
              viewMode === 'list'
                ? 'relative p-4 hover:bg-gray-800/50 transition-colors'
                : 'bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors'
            } ${selectedTransactions.includes(transaction.id || '') ? 'bg-blue-900/20' : ''}`}
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-offset-gray-900"
                checked={selectedTransactions.includes(transaction.id || '')}
                onChange={() => toggleTransaction(transaction.id || '')}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="text-sm font-medium text-white truncate pr-4">
                      {transaction.description}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-medium ${
                      transaction.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {transaction.type === TransactionType.INCOME ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <div className="text-sm text-gray-400">
                      {(() => {
                        // Try direct lookup first
                        if (transaction.accountId && accountMap[transaction.accountId]) {
                          return accountMap[transaction.accountId];
                        }
                        
                        // Try string conversion
                        const accountIdStr = String(transaction.accountId);
                        if (accountMap[accountIdStr]) {
                          return accountMap[accountIdStr];
                        }
                        
                        // If it's an object with _id property (MongoDB format)
                        if (transaction.accountId && typeof transaction.accountId === 'object') {
                          const accountObj = transaction.accountId as any;
                          if (accountObj._id) {
                            if (accountMap[accountObj._id]) {
                              return accountMap[accountObj._id];
                            }
                            if (accountMap[String(accountObj._id)]) {
                              return accountMap[String(accountObj._id)];
                            }
                          }
                        }
                        
                        // Fallback
                        return transaction.accountId ? 'Unknown Account' : 'No Account ID';
                      })()} 
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300">
                    {transaction.category}
                  </span>
                  {transaction.tags && transaction.tags.length > 0 && (
                    <span className="inline-flex items-center text-xs text-gray-400">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      {transaction.tags.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => onTransactionChange && transaction.id && onEdit && onEdit(transaction)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  className="text-gray-400 hover:text-rose-400"
                  onClick={() => transaction.id && handleDelete(transaction.id)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white">No transactions</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by adding a new transaction.</p>
          <button className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-xl hover:bg-blue-500/30 transition-colors">
            Add Transaction
          </button>
        </div>
      )}
    </div>
  );
}
