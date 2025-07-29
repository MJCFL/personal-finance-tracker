'use client';

import React, { useState, useEffect } from 'react';
import { Budget, BudgetCategory } from '@/types/budget';
import { getBudgets } from '@/services/budgetService';
import ErrorMessage from '@/components/ui/ErrorMessage';

const BudgetReports: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total budget and spent amounts
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Group budgets by category for the category breakdown
  const categoryTotals = budgets.reduce((acc: Record<string, { budget: number; spent: number }>, budget) => {
    const category = budget.category;
    if (!acc[category]) {
      acc[category] = { budget: 0, spent: 0 };
    }
    acc[category].budget += budget.amount;
    acc[category].spent += budget.spent;
    return acc;
  }, {});

  // Find budgets that are over their limit
  const overBudgetItems = budgets.filter(budget => budget.spent > budget.amount)
    .sort((a, b) => (b.spent - b.amount) - (a.spent - a.amount));

  // Generate months for the dropdown (last 6 months)
  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">Budget Reports</h2>
        
        <div className="flex items-center">
          <label htmlFor="month-select" className="mr-2 text-sm font-medium">
            Month:
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">
            No budget data available. Create some budgets to see reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                <p className={`text-xl font-bold ${
                  totalRemaining >= 0 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(totalRemaining)}
                </p>
              </div>
            </div>
            
            {/* Overall Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>{spendingPercentage.toFixed(1)}% of budget used</span>
                <span>
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    spendingPercentage > 100 
                      ? 'bg-red-500' 
                      : spendingPercentage > 85 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Status Message */}
            <div className="text-center p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              {spendingPercentage > 100 ? (
                <p className="text-red-600 dark:text-red-400 font-medium">
                  You're over budget by {formatCurrency(totalSpent - totalBudget)}
                </p>
              ) : spendingPercentage > 85 ? (
                <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                  You're approaching your budget limit
                </p>
              ) : (
                <p className="text-green-600 dark:text-green-400 font-medium">
                  You're doing well with your budget
                </p>
              )}
            </div>
          </div>
          
          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
            
            <div className="space-y-4">
              {Object.entries(categoryTotals).map(([category, { budget, spent }]) => {
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                return (
                  <div key={category} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{category}</span>
                      <span>
                        {formatCurrency(spent)} / {formatCurrency(budget)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          percentage > 100 
                            ? 'bg-red-500' 
                            : percentage > 85 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Over Budget Alert */}
          {overBudgetItems.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
                Over Budget Alert
              </h3>
              
              <div className="space-y-4">
                {overBudgetItems.map((budget) => {
                  const overAmount = budget.spent - budget.amount;
                  const overPercentage = (overAmount / budget.amount) * 100;
                  
                  return (
                    <div key={budget.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{budget.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {budget.category}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-red-600 dark:text-red-400 font-medium">
                          Over by {formatCurrency(overAmount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {overPercentage.toFixed(1)}% over budget
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Spending Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Spending Insights</h3>
            
            <div className="space-y-4">
              {/* This would ideally be a chart, but for now we'll use text insights */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Top Spending Categories</h4>
                <ul className="space-y-2">
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1].spent - a[1].spent)
                    .slice(0, 3)
                    .map(([category, { spent }], index) => (
                      <li key={category} className="flex justify-between">
                        <span>
                          {index + 1}. {category}
                        </span>
                        <span className="font-medium">{formatCurrency(spent)}</span>
                      </li>
                    ))
                  }
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Budget Efficiency</h4>
                <ul className="space-y-2">
                  {Object.entries(categoryTotals)
                    .map(([category, { budget, spent }]) => ({
                      category,
                      budget,
                      spent,
                      efficiency: budget > 0 ? (1 - spent / budget) * 100 : 0,
                    }))
                    .sort((a, b) => b.efficiency - a.efficiency)
                    .slice(0, 3)
                    .map((item) => (
                      <li key={item.category} className="flex justify-between">
                        <span>{item.category}</span>
                        <span className={`font-medium ${
                          item.efficiency >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.efficiency >= 0 
                            ? `${item.efficiency.toFixed(1)}% under budget` 
                            : `${Math.abs(item.efficiency).toFixed(1)}% over budget`}
                        </span>
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetReports;
