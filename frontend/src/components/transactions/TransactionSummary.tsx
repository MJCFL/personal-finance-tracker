'use client';

import React from 'react';

interface TransactionSummaryProps {
  income: number;
  expenses: number;
  netIncome: number;
  monthlyChange: number;
}

export default function TransactionSummary({ income, expenses, netIncome, monthlyChange }: TransactionSummaryProps) {
  return (
    <div className="bg-gray-900 rounded-3xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-6">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative">
            <div className="w-12 h-12 mb-4 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-400">Total Income</h3>
            <p className="mt-2 text-2xl font-light text-emerald-400">
              ${income.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 p-6">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-rose-500/20 blur-2xl" />
          <div className="relative">
            <div className="w-12 h-12 mb-4 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-400">Total Expenses</h3>
            <p className="mt-2 text-2xl font-light text-rose-400">
              ${expenses.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-6">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="relative">
            <div className="w-12 h-12 mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-400">Net Income</h3>
            <p className="mt-2 text-2xl font-light text-blue-400">
              ${netIncome.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-6">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-500/20 blur-2xl" />
          <div className="relative">
            <div className="w-12 h-12 mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-400">Monthly Change</h3>
            <p className={`mt-2 text-2xl font-light ${monthlyChange >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
              {monthlyChange >= 0 ? '+' : ''}{monthlyChange}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
