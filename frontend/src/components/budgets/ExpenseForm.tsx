'use client';

import React, { useState, useEffect } from 'react';
import { Budget } from '@/types/budget';
import { getBudgets, updateBudgetSpent } from '@/services/budgetService';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    budgetId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch budgets on component mount
  useEffect(() => {
    fetchBudgets();
  }, []);

  // Function to fetch budgets
  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgets();
      setBudgets(data);
      
      // Set default budget if available
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, budgetId: data[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      // Validate form data
      if (!formData.budgetId) {
        throw new Error('Please select a budget');
      }
      
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than zero');
      }

      // Update the budget's spent amount
      await updateBudgetSpent(formData.budgetId, amount);
      
      // Show success message
      setSuccess('Expense recorded successfully!');
      
      // Reset form
      setFormData({
        budgetId: formData.budgetId, // Keep the selected budget
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      // Refresh budgets to show updated spent amounts
      fetchBudgets();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Record Expense</h2>
      
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>You don't have any budgets yet. Create a budget first to record expenses.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Budget Selection */}
          <div>
            <label htmlFor="budgetId" className="block text-sm font-medium mb-1">
              Select Budget
            </label>
            <select
              id="budgetId"
              name="budgetId"
              value={formData.budgetId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name} (Remaining: ${(budget.amount - budget.spent).toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          
          {/* Expense Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Expense Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What was this expense for?"
              rows={3}
            />
          </div>
          
          {/* Expense Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                submitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ExpenseForm;
