"use client";

import React from 'react';

interface BudgetCategory {
  category: string;
  spent: number;
  budget: number;
  color: string;
}

const mockBudgetData: BudgetCategory[] = [
  {
    category: 'Housing',
    spent: 1800,
    budget: 2000,
    color: 'bg-blue-500',
  },
  {
    category: 'Food & Dining',
    spent: 850,
    budget: 800,
    color: 'bg-green-500',
  },
  {
    category: 'Transportation',
    spent: 300,
    budget: 400,
    color: 'bg-purple-500',
  },
];

export default function BudgetPreviewCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>

      <div className="space-y-4">
        {mockBudgetData.map((category) => {
          const percentage = (category.spent / category.budget) * 100;
          const isOverBudget = percentage > 100;
          const warningLevel = percentage >= 90 ? 'bg-red-100' : percentage >= 75 ? 'bg-yellow-100' : 'bg-gray-100';
          
          return (
            <div key={category.category} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{category.category}</span>
                <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                  ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                </span>
              </div>
              
              <div className={`w-full h-2 rounded-full ${warningLevel}`}>
                <div
                  className={`h-full rounded-full ${category.color}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              {isOverBudget && (
                <p className="text-xs text-red-600">
                  ${(category.spent - category.budget).toLocaleString()} over budget
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
