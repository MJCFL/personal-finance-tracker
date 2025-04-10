'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
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
        : transactions.map(t => t.id)
    );
  };

  return (
    <div className="bg-gray-900 rounded-3xl">
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
              <button className="text-sm text-rose-400 hover:text-rose-300">
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
            key={transaction.id}
            className={`group ${
              viewMode === 'list'
                ? 'relative p-4 hover:bg-gray-800/50 transition-colors'
                : 'bg-gray-800/30 rounded-xl p-4 hover:bg-gray-800/50 transition-colors'
            } ${selectedTransactions.includes(transaction.id) ? 'bg-blue-900/20' : ''}`}
          >
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-offset-gray-900"
                checked={selectedTransactions.includes(transaction.id)}
                onChange={() => toggleTransaction(transaction.id)}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="text-sm font-medium text-white truncate pr-4">
                      {transaction.description}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {transaction.source} • {transaction.account}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-medium ${
                      transaction.amount >= 0 ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{transaction.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300">
                    {transaction.category}
                  </span>
                  {transaction.notes && (
                    <span className="inline-flex items-center text-xs text-gray-400">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      {transaction.notes}
                    </span>
                  )}
                </div>
              </div>

              <button className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
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
