'use client';

import React, { useState, useEffect } from 'react';
import { Budget, BudgetCategory, BUDGET_CATEGORIES } from '@/types/budget';
import { getBudgets, deleteBudget } from '@/services/budgetService';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import eventEmitter, { FINANCIAL_DATA_CHANGED } from '@/utils/eventEmitter';

interface BudgetListProps {
  onEditBudget: (budget: Budget) => void;
  onCreateBudget: () => void;
}

const BudgetList: React.FC<BudgetListProps> = ({ onEditBudget, onCreateBudget }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch budgets on component mount
  useEffect(() => {
    fetchBudgets();
    
    // Subscribe to financial data change events
    const unsubscribe = eventEmitter.on(FINANCIAL_DATA_CHANGED, () => {
      console.log('FINANCIAL_DATA_CHANGED event received in BudgetList');
      fetchBudgets();
    });
    
    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  // Function to fetch budgets
  const fetchBudgets = async () => {
    console.log('BudgetList: fetchBudgets called');
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgets();
      console.log('BudgetList: Fetched budgets data:', data);
      setBudgets(data);
    } catch (err: any) {
      console.error('BudgetList: Error fetching budgets:', err);
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle budget deletion
  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await deleteBudget(id);
      setBudgets(budgets.filter(budget => budget.id !== id));
      setSuccess('Budget deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget');
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filter budgets by category
  const filteredBudgets = selectedCategory === 'all'
    ? budgets
    : budgets.filter(budget => budget.category === selectedCategory);

  // Get category label from value
  const getCategoryLabel = (value: string) => {
    const category = BUDGET_CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Budgets</h2>
        <button
          onClick={onCreateBudget}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <span className="mr-2">+</span> New Budget
        </button>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* Category Filter */}
      <div className="mb-4">
        <label htmlFor="categoryFilter" className="block text-sm font-medium mb-1">
          Filter by Category
        </label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {BUDGET_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {selectedCategory === 'all' ? (
            <p>You don't have any budgets yet. Create one to get started!</p>
          ) : (
            <p>No budgets found in this category.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBudgets.map((budget) => (
            <div
              key={budget.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{budget.name}</h3>
                  <p className="text-sm text-gray-500">
                    {getCategoryLabel(budget.category)} • {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('BudgetList: Edit button clicked for budget:', budget);
                      // Create a clean copy of the budget with proper ID formatting
                      const budgetCopy = {
                        ...budget,
                        id: budget.id.toString()
                      };
                      console.log('BudgetList: Passing cleaned budget copy to edit:', budgetCopy);
                      onEditBudget(budgetCopy);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <div className="w-full">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{Math.min(Math.round((budget.spent / budget.amount) * 100), 100)}% used</span>
                    {budget.spent > budget.amount && (
                      <span className="text-red-500 font-medium">
                        Over budget by {((budget.spent - budget.amount) / budget.amount * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className={`h-2.5 rounded-full ${budget.spent >= budget.amount ? 'bg-red-500' : budget.spent >= budget.amount * 0.75 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                      style={{ width: `${Math.min(Math.round((budget.spent / budget.amount) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span>
                  Spent: <span className="font-medium">{formatCurrency(budget.spent)}</span>
                </span>
                <span>
                  Budget: <span className="font-medium">{formatCurrency(budget.amount)}</span>
                </span>
                <span>
                  Remaining:{' '}
                  <span className={`font-medium ${budget.spent > budget.amount ? 'text-red-500' : 'text-green-500'}`}>
                    {formatCurrency(budget.amount - budget.spent)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetList;
