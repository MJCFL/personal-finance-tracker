"use client";

import React, { useState, useEffect } from 'react';
import { getTransactions } from '@/services/transactionService';
import { getBudgets } from '@/services/budgetService';
import { TransactionType } from '@/types/commonTypes';
import { BudgetCategory, Budget } from '@/types/budget';
import eventEmitter, { FINANCIAL_DATA_CHANGED } from '@/utils/eventEmitter';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch budget data
  async function fetchBudgetData() {
    try {
      setLoading(true);
      
      // Get real budgets from the database
      const userBudgets = await getBudgets();
      
      if (userBudgets.length === 0) {
        // No budgets found
        setBudgetData([]);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Get transactions from the current month for spending calculation
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
      
      const response = await getTransactions({
        startDate,
        endDate,
        type: TransactionType.EXPENSE
      });
      
      // Convert budgets to budget items for display
      const budgetItems: BudgetItem[] = userBudgets.map(budget => {
        // Get the category color
        const color = categoryColors[budget.category] || 'bg-slate-500';
        
        return {
          category: budget.name,
          spent: budget.spent,
          budget: budget.amount,
          color: color
        };
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

  // Initial fetch
  useEffect(() => {
    fetchBudgetData();
  }, []);
  
  // Listen for financial data changes
  useEffect(() => {
    // Function to handle financial data changes
    const handleFinancialDataChanged = () => {
      fetchBudgetData();
    };
    
    // Subscribe to financial data changes and get the unsubscribe function
    const unsubscribe = eventEmitter.on(FINANCIAL_DATA_CHANGED, handleFinancialDataChanged);
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-semibold text-gray-900">Budget Overview</h3>
        <button 
          onClick={() => router.push('/budgets')} 
          className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-28">
          <p className="text-xs text-gray-500">Loading budget data...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-28">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      ) : budgetData.length === 0 ? (
        <div className="flex items-center justify-center h-28">
          <p className="text-xs text-gray-500">No budget data available</p>
        </div>
      ) : (
      <div className="space-y-2">
        {budgetData.map((category) => {
          const percentage = (category.spent / category.budget) * 100;
          const isOverBudget = percentage > 100;
          const warningLevel = percentage >= 90 ? 'bg-red-100' : percentage >= 75 ? 'bg-yellow-100' : 'bg-gray-100';
          
          return (
            <div key={category.category} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">{category.category}</span>
                <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                  ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                </span>
              </div>
              
              <div className={`w-full h-1.5 rounded-full ${warningLevel}`}>
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
