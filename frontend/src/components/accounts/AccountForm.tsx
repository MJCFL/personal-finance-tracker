import React, { useState } from 'react';
import { AccountData, createAccount, updateAccount } from '@/services/accountService';
import { AccountType } from '@/types/account';

interface AccountFormProps {
  account: AccountData | null;
  onSave: () => void;
  onCancel: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ account, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AccountData>({
    name: account?.name || '',
    type: account?.type || AccountType.CHECKING,
    balance: account?.balance || 0,
    institution: account?.institution || '',
    accountNumber: account?.accountNumber || '',
    isActive: account?.isActive !== undefined ? account.isActive : true,
    notes: account?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
      return;
    }
    
    // Handle all other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }
    
    if (formData.accountNumber && formData.accountNumber.length > 4) {
      newErrors.accountNumber = 'For security, only enter the last 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (account?.id) {
        // Update existing account
        await updateAccount(account.id, formData);
      } else {
        // Create new account
        await createAccount(formData);
      }
      
      onSave();
    } catch (error: any) {
      console.error('Error saving account:', error);
      setErrors(prev => ({ ...prev, form: error.message || 'Failed to save account' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General error message */}
      {errors.form && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.form}
        </div>
      )}
      
      {/* Account Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Account Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : ''
          }`}
          placeholder="e.g., Primary Checking"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      {/* Account Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Account Type *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {Object.values(AccountType).map(type => (
            <option key={type} value={type}>
              {type.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
      
      {/* Institution */}
      <div>
        <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
          Financial Institution *
        </label>
        <input
          type="text"
          id="institution"
          name="institution"
          value={formData.institution}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.institution ? 'border-red-500' : ''
          }`}
          placeholder="e.g., Chase Bank"
        />
        {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
      </div>
      
      {/* Account Number (last 4) */}
      <div>
        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
          Last 4 Digits of Account Number
        </label>
        <input
          type="text"
          id="accountNumber"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          maxLength={4}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.accountNumber ? 'border-red-500' : ''
          }`}
          placeholder="e.g., 1234"
        />
        {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
        <p className="mt-1 text-xs text-gray-500">For security, only enter the last 4 digits</p>
      </div>
      
      {/* Current Balance */}
      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
          Current Balance *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="balance"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            step="0.01"
            className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="0.00"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">USD</span>
          </div>
        </div>
      </div>
      
      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Account is active
        </label>
      </div>
      
      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Any additional information about this account"
        />
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : account?.id ? 'Update Account' : 'Create Account'}
        </button>
      </div>
    </form>
  );
};

export default AccountForm;
