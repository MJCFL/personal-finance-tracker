"use client";

import React, { useState, useEffect } from 'react';
import { getTransactions } from '@/services/transactionService';
import { TransactionType } from '@/types/commonTypes';
import { BudgetCategory } from '@/types/budget';

interface BudgetItem {
  category: string;
  spent: number;
  budget: number;
  color: string;
}

// Define category colors for consistent visualization
const categoryColors: Record<string, string> = {
  Housing: 'bg-blue-500',
  Food: 'bg-green-500',
  Transport: 'bg-purple-500',
  Shopping: 'bg-amber-500',
  Entertainment: 'bg-pink-500',
  Utilities: 'bg-indigo-500',
  Healthcare: 'bg-red-500',
  Education: 'bg-orange-500',
  Travel: 'bg-teal-500',
  Debt: 'bg-violet-500',
  Savings: 'bg-emerald-500',
  Investments: 'bg-sky-500',
  Other: 'bg-slate-500'
};

export default function BudgetPreviewCard() {
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBudgetData() {
      try {
        setLoading(true);
        
        // Get transactions from the current month
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
        
        const response = await getTransactions({
          startDate,
          endDate,
          type: TransactionType.EXPENSE
        });
        
        // Define some default budgets (in a real app, these would come from a budget API)
        const defaultBudgets: Record<string, number> = {
          Housing: 2000,
          Food: 800,
          Transport: 400,
          Shopping: 500,
          Entertainment: 300,
          Utilities: 350,
          Healthcare: 200,
          Education: 150,
          Travel: 300,
          Other: 200
        };
        
        // Group transactions by category
        const categorySpending: Record<string, number> = {};
        
        response.transactions.forEach(transaction => {
          if (transaction.type === TransactionType.EXPENSE) {
            const category = transaction.category || 'Other';
            categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
          }
        });
        
        // Create budget items from spending data
        const budgetItems: BudgetItem[] = [];
        
        // Add categories with spending
        Object.entries(categorySpending).forEach(([category, spent]) => {
          budgetItems.push({
            category,
            spent,
            budget: defaultBudgets[category] || 500, // Use default budget or fallback to $500
            color: categoryColors[category] || 'bg-slate-500'
          });
        });
        
        // Sort by percentage spent (highest first)
        budgetItems.sort((a, b) => (b.spent / b.budget) - (a.spent / a.budget));
        
        // Take top 3 categories
        setBudgetData(budgetItems.slice(0, 3));
        setError(null);
      } catch (err) {
        console.error('Error fetching budget data:', err);
        setError('Failed to load budget data');
      } finally {
        setLoading(false);
      }
    }

    fetchBudgetData();
  }, []);
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">Loading budget data...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">{error}</p>
        </div>
      ) : budgetData.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">No budget data available</p>
        </div>
      ) : (
      <div className="space-y-4">
        {budgetData.map((category) => {
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
      )}
    </div>
  );
}
