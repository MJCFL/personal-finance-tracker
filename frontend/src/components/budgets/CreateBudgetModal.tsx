import React, { useState } from 'react';

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormData) => void;
}

interface BudgetFormData {
  category: string;
  amount: string;
  period: 'weekly' | 'monthly';
  rollover: boolean;
  startDate: string;
  notes: string;
}

const categories = [
  { name: 'Housing', icon: '🏠' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Food', icon: '🍽️' },
  { name: 'Utilities', icon: '💡' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Personal Care', icon: '💆' },
  { name: 'Education', icon: '📚' },
  { name: 'Other', icon: '📌' },
];

export default function CreateBudgetModal({ isOpen, onClose, onSubmit }: CreateBudgetModalProps) {
  const [formData, setFormData] = useState<BudgetFormData>({
    category: '',
    amount: '',
    period: 'monthly',
    rollover: false,
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleInputChange = (field: keyof BudgetFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
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
              {categories.map(({ name, icon }) => (
                <option key={name} value={name}>
                  {icon} {name}
                </option>
              ))}
            </select>
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
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="block w-full pl-7 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Budget Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Period
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="monthly"
                  checked={formData.period === 'monthly'}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Monthly</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="weekly"
                  checked={formData.period === 'weekly'}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Weekly</span>
              </label>
            </div>
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
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Rollover Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.rollover}
              onChange={(e) => handleInputChange('rollover', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Roll over unused budget to next period
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
