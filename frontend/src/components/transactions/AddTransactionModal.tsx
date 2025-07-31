import React, { useState, useEffect } from 'react';
import { createTransaction } from '@/services/transactionService';
import { BudgetCategory, TransactionType } from '@/types/commonTypes';

interface TransactionFormData {
  type: TransactionType;
  date: string;
  description: string;
  amount: string;
  category: BudgetCategory;
  accountId: string;
  budgetId?: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
}

interface AddTransactionModalProps {
  onClose: () => void;
  onTransactionAdded?: () => void;
  accounts: any[];
}

const categories: BudgetCategory[] = [
  BudgetCategory.HOUSING,
  BudgetCategory.TRANSPORTATION,
  BudgetCategory.FOOD,
  BudgetCategory.ENTERTAINMENT,
  BudgetCategory.HEALTHCARE,
  BudgetCategory.EDUCATION,
  BudgetCategory.PERSONAL,
  BudgetCategory.UTILITIES,
  BudgetCategory.INSURANCE,
  BudgetCategory.SAVINGS,
  BudgetCategory.OTHER
];

export default function AddTransactionModal({ onClose, onTransactionAdded, accounts }: AddTransactionModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: BudgetCategory.OTHER,
    accountId: '',
    isRecurring: false,
    recurringFrequency: undefined,
    tags: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set default account if available
  useEffect(() => {
    if (accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({
        ...prev,
        accountId: accounts[0].id
      }));
    }
  }, [accounts]);

  const handleInputChange = (field: keyof TransactionFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.accountId) {
        throw new Error('Please select an account');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Please enter a description');
      }
      
      // Convert amount to number
      const amountValue = parseFloat(formData.amount);
      
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Please enter a valid amount greater than zero');
      }
      
      // Create transaction object
      const transactionData = {
        ...formData,
        amount: formData.type === TransactionType.INCOME ? amountValue : Math.abs(amountValue),
        date: new Date(formData.date)
      };
      
      console.log('Submitting transaction:', transactionData);
      
      // Submit to API
      await createTransaction(transactionData);
      
      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded();
      }
      
      // Close modal
      onClose();
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Failed to add transaction');
      setIsSubmitting(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Transaction</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.type === 'expense'}
                onChange={() => handleInputChange('type', 'expense')}
                className="mr-2"
              />
              <span>Expense</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={formData.type === 'income'}
                onChange={() => handleInputChange('type', 'income')}
                className="mr-2"
              />
              <span>Income</span>
            </label>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., groceries, monthly, essential"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => {
                const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                handleInputChange('tags', tagsArray as any);
              }}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="block w-full pl-7 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Account</label>
            <select
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.accountId}
              onChange={(e) => handleInputChange('accountId', e.target.value)}
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} (${account.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Recurring Transaction */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Recurring Transaction</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.recurringFrequency}
                onChange={(e) => handleInputChange('recurringFrequency', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Select frequency</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                'Add Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
