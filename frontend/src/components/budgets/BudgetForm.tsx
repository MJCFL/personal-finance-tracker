'use client';

import React, { useState, useEffect } from 'react';
import { Budget, BudgetCategory, BudgetFormData, BUDGET_CATEGORIES, BudgetPeriod } from '@/types/budget';
import { createBudget, updateBudget } from '@/services/budgetService';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import { handleNumberInputChange } from '@/utils/inputHelpers';

interface BudgetFormProps {
  budget?: Budget;
  onSuccess?: (budget: Budget) => void;
  onCancel?: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ 
  budget, 
  onSuccess,
  onCancel
}) => {
  const isEditing = !!budget;
  
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    category: BudgetCategory.OTHER,
    amount: 0,
    period: 'monthly' as BudgetPeriod,
    startDate: new Date().toISOString().split('T')[0],
    isRecurring: true,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with budget data if editing
  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        startDate: budget.startDate.split('T')[0],
        endDate: budget.endDate ? budget.endDate.split('T')[0] : undefined,
        isRecurring: budget.isRecurring,
      });
    }
  }, [budget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'amount') {
      // Use our custom number input handler for better user experience
      handleNumberInputChange(value, (newValue) => {
        setFormData(prev => ({ ...prev, [name]: newValue === '' ? 0 : newValue }));
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      let result;
      
      if (isEditing && budget) {
        result = await updateBudget(budget.id, formData);
        setSuccess('Budget updated successfully!');
      } else {
        result = await createBudget(formData);
        setSuccess('Budget created successfully!');
        
        // Reset form after successful creation
        if (!isEditing) {
          setFormData({
            name: '',
            category: BudgetCategory.OTHER,
            amount: 0,
            period: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            isRecurring: true,
          });
        }
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Budget' : 'Create New Budget'}
      </h2>
      
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Budget Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Budget Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Monthly Groceries"
          />
        </div>
        
        {/* Budget Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {BUDGET_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Budget Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Budget Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              $
            </span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount === 0 ? '' : formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
        
        {/* Budget Period */}
        <div>
          <label htmlFor="period" className="block text-sm font-medium mb-1">
            Period
          </label>
          <select
            id="period"
            name="period"
            value={formData.period}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Is Recurring */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isRecurring" className="ml-2 block text-sm">
            Recurring Budget
          </label>
        </div>
        
        {/* End Date (only shown if not recurring) */}
        {!formData.isRecurring && (
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Budget'
              : 'Create Budget'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
