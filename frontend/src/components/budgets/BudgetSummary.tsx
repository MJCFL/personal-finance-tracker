import React from 'react';

interface BudgetSummaryProps {
  totalBudget: number;
  totalSpent: number;
  totalSavings: number;
}

export default function BudgetSummary({ totalBudget, totalSpent, totalSavings }: BudgetSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Budget</h3>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          ${totalBudget.toLocaleString()}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          ${totalSpent.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-sm font-medium text-gray-500">Total Savings</h3>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          ${totalSavings.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
