import React, { useState, useEffect } from 'react';
import { BudgetFormData, BudgetCategory, BudgetPeriod, BUDGET_CATEGORIES } from '@/types/budget';
import { createBudget } from '@/services/budgetService';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateBudgetModal({ isOpen, onClose, onSuccess }: CreateBudgetModalProps) {
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    category: BudgetCategory.OTHER,
    amount: 0,
    period: 'monthly' as BudgetPeriod,
    startDate: new Date().toISOString().split('T')[0],
    isRecurring: true,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear field error when user changes a field
  const handleInputChange = (field: keyof BudgetFormData, value: any) => {
    // Clear the error for this field
    setFieldErrors(prev => ({
      ...prev,
      [field]: ''
    }));
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  // Validate the form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
      isValid = false;
    }
    
    // Validate amount
    if (formData.amount <= 0) {
      newErrors.amount = 'Budget amount must be greater than zero';
      isValid = false;
    }
    
    // Validate start date
    try {
      const startDate = new Date(formData.startDate);
      if (isNaN(startDate.getTime())) {
        newErrors.startDate = 'Invalid start date';
        isValid = false;
      }
    } catch (error) {
      newErrors.startDate = 'Invalid start date format';
      isValid = false;
    }
    
    // Validate end date if not recurring
    if (!formData.isRecurring && formData.endDate) {
      try {
        const endDate = new Date(formData.endDate);
        const startDate = new Date(formData.startDate);
        
        if (isNaN(endDate.getTime())) {
          newErrors.endDate = 'Invalid end date';
          isValid = false;
        } else if (endDate <= startDate) {
          newErrors.endDate = 'End date must be after start date';
          isValid = false;
        }
      } catch (error) {
        newErrors.endDate = 'Invalid end date format';
        isValid = false;
      }
    }
    
    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    
    // Validate the form first
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Log the form data being sent
    console.log('Submitting budget form data:', formData);
    
    try {
      await createBudget(formData);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('Budget creation error:', err);
      
      // Check for authentication errors
      if (err.message && err.message.includes('Authentication required')) {
        setError('You must be signed in to create a budget. Please sign in and try again.');
      }
      // Check for validation errors
      else if (err.validationErrors) {
        const newFieldErrors: Record<string, string> = {};
        
        // Map backend validation errors to form fields
        Object.entries(err.validationErrors).forEach(([field, message]) => {
          newFieldErrors[field] = message as string;
        });
        
        setFieldErrors(newFieldErrors);
        
        const errorMessages = Object.entries(err.validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        setError(`Validation error: ${errorMessages}`);
      } else {
        setError(err.message || 'An error occurred while creating the budget.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Budget</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>
        
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Budget Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Monthly Groceries"
              required
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${fieldErrors.category ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              {BUDGET_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
            )}
          </div>

          {/* Budget Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`block w-full pl-7 rounded-md focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${fieldErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>
            {fieldErrors.amount && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.amount}</p>
            )}
          </div>

          {/* Budget Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Period
            </label>
            <select
              value={formData.period}
              onChange={(e) => handleInputChange('period', e.target.value)}
              className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${fieldErrors.period ? 'border-red-500' : 'border-gray-300'}`}
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            {fieldErrors.period && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.period}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${fieldErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {fieldErrors.startDate && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.startDate}</p>
            )}
          </div>

          {/* Is Recurring Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Recurring Budget
            </label>
          </div>
          
          {/* End Date (only shown if not recurring) */}
          {!formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${fieldErrors.endDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {fieldErrors.endDate && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.endDate}</p>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
