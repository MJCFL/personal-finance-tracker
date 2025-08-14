import React, { useState, useEffect } from 'react';
import { AccountData, createAccount, updateAccount } from '@/services/accountService';
import { AccountType, Account } from '@/types/account';
import { handleNumberInputChange } from '@/utils/inputHelpers';
import SavingsBuckets from './SavingsBuckets';

interface AccountFormProps {
  initialData?: AccountData | null;
  onSave: (account: AccountData) => void;
  onCancel?: () => void;
  isEdit?: boolean;
  showBucketsManagement?: boolean;
}

const AccountForm: React.FC<AccountFormProps> = ({ initialData, onSave, onCancel, isEdit = false, showBucketsManagement = false }) => {
  // Debug: Log the initialData being received
  console.log('AccountForm initialData:', initialData);
  
  // Determine if we're in edit mode based on props and initialData
  const isEditMode = isEdit || (initialData && initialData.id) ? true : false;
  console.log('isEditMode:', isEditMode);
  
  // Initialize form data with empty values first
  const [formData, setFormData] = useState<Partial<AccountData> & { balanceInput?: string; interestRateInput?: string; minimumPaymentInput?: string; }>({
    name: initialData?.name || '',
    type: initialData?.type || AccountType.CHECKING,
    balance: initialData?.balance || 0,
    institution: initialData?.institution || '',
    accountNumber: initialData?.accountNumber || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    notes: initialData?.notes || '',
    interestRate: initialData?.interestRate !== undefined ? initialData.interestRate : 0,
    minimumPayment: initialData?.minimumPayment || undefined,
    balanceInput: initialData?.balance ? initialData.balance.toString() : '',
    interestRateInput: initialData?.interestRate !== undefined ? initialData.interestRate.toString() : '0',
    minimumPaymentInput: initialData?.minimumPayment ? initialData.minimumPayment.toString() : '',
  });
  
  // Separate state for balance input to preserve string format during typing
  const [balanceInput, setBalanceInput] = useState<string>(
    initialData?.balance !== undefined ? initialData.balance.toString() : ''
  );
  
  // Use a ref to track if this is the first render
  const isFirstRender = React.useRef(true);

  // Add useEffect to update form data when initialData changes
  useEffect(() => {
    // Only update if we have initialData and either:
    // 1. It's the first render, or
    // 2. The initialData has changed
    if (initialData && initialData.id) {
      console.log('Updating form data from initialData:', initialData);
      
      // Update form data with initialData values
      setFormData({
        name: initialData.name || '',
        type: initialData.type || AccountType.CHECKING,
        balance: initialData.balance || 0,
        institution: initialData.institution || '',
        accountNumber: initialData.accountNumber || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        notes: initialData.notes || '',
        interestRate: initialData.interestRate !== undefined ? initialData.interestRate : 0,
        minimumPayment: initialData.minimumPayment || undefined,
        balanceInput: initialData.balance !== undefined ? initialData.balance.toString() : '',
        interestRateInput: initialData.interestRate !== undefined ? initialData.interestRate.toString() : '0',
        minimumPaymentInput: initialData.minimumPayment ? initialData.minimumPayment.toString() : '',
        buckets: initialData.buckets || [],
      });
      
      // Update balance input separately
      if (initialData.balance !== undefined) {
        setBalanceInput(initialData.balance.toString());
      }
    }
    
    // Mark that we've done the first render
    isFirstRender.current = false;
  }, [initialData]);

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
      // Special handling for interestRate field
      if (name === 'interestRate') {
        const numValue = value === '' ? 0 : parseFloat(value);
        setFormData(prev => ({
          ...prev,
          interestRate: numValue,
          interestRateInput: value
        }));
        return;
      }
      
      // Handle other number inputs
      handleNumberInputChange(value, (newValue) => {
        setFormData(prev => ({ ...prev, [name]: newValue }));
      }, true); // Allow empty for all number fields to support leading zeros
      return;
    }
    
    // Handle all other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!formData.institution?.trim()) {
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
    setErrors({});

    try {
      // Create account data object from form data
      const accountData: Partial<AccountData> = {
        name: formData.name,
        type: formData.type,
        balance: Number(formData.balance),
        institution: formData.institution,
        isActive: formData.isActive,
      };

      // Add optional fields if they have values
      if (formData.accountNumber) accountData.accountNumber = formData.accountNumber;
      if (formData.notes) accountData.notes = formData.notes;
      
      // Handle interest rate specifically for liability accounts
      if (formData.type === AccountType.CREDIT_CARD || 
          formData.type === AccountType.LOAN || 
          formData.type === AccountType.MORTGAGE) {
        // CRITICAL FIX: Always explicitly include interestRate for liability accounts
        // Force a number type and ensure it's not undefined, even if it's 0
        const interestRateValue = formData.interestRate !== undefined ? Number(formData.interestRate) : 0;
        
        // Ensure we're sending a valid number, not NaN
        accountData.interestRate = isNaN(interestRateValue) ? 0 : interestRateValue;
        
        // Log the interest rate value being set
        console.log('Setting interest rate for liability account:', accountData.interestRate, 
                    'from formData.interestRate:', formData.interestRate, 
                    'type:', typeof formData.interestRate);
      } else if (formData.interestRate !== undefined) {
        // For non-liability accounts, only include if explicitly set
        accountData.interestRate = Number(formData.interestRate);
      }
      
      // Handle minimum payment for liability accounts
      if (formData.type === AccountType.CREDIT_CARD || 
          formData.type === AccountType.LOAN || 
          formData.type === AccountType.MORTGAGE) {
        if (formData.minimumPayment !== undefined) {
          accountData.minimumPayment = Number(formData.minimumPayment);
        }
      }
      
      // Log the clean account data for debugging
      console.log('Clean account data for submission:', accountData);
      
      let savedAccount;
      if (initialData?.id) {
        // Update existing account
        savedAccount = await updateAccount(initialData.id, accountData as AccountData);
      } else {
        // Create new account
        savedAccount = await createAccount(accountData as AccountData);
      }
      
      // Use handleSaveComplete instead of directly calling onSave
      handleSaveComplete(savedAccount);
    } catch (error: any) {
      console.error('Error saving account:', error);
      setErrors(prev => ({ ...prev, form: error.message || 'Failed to save account' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const [showBuckets, setShowBuckets] = useState(false);
  const [savedAccount, setSavedAccount] = useState<Account | null>(null);

  // Show buckets UI after account is saved if it's a savings account
  const handleSaveComplete = async (savedAcc: AccountData) => {
    // Convert AccountData to Account by adding required fields
    const fullAccount: Account = {
      ...savedAcc,
      id: savedAcc.id || '',
      userId: savedAcc.userId || '',
      buckets: savedAcc.buckets || []
    };
    
    setSavedAccount(fullAccount);
    if (fullAccount.type === AccountType.SAVINGS) {
      setShowBuckets(true);
    } else {
      onSave(fullAccount);
    }
  };

  // Handle bucket updates
  const handleBucketUpdate = (updatedAccount: Account) => {
    setSavedAccount(updatedAccount);
  };

  // Handle completion of bucket setup
  const handleBucketsDone = () => {
    if (savedAccount) {
      onSave(savedAccount);
    }
  };

  return (
    <div>
      {isEditMode && (
        <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Account</h2>
        </div>
      )}
      {!showBuckets ? (
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
            type="text"
            id="balance"
            name="balance"
            value={balanceInput}
            onChange={(e) => {
              const value = e.target.value;
              
              // Allow empty input, single decimal point, or valid numbers (including leading zeros)
              if (value === '' || value === '.' || value === '0' || value === '0.' || !isNaN(parseFloat(value))) {
                setBalanceInput(value);
                
                // Update the actual form data with the numeric value when appropriate
                if (value === '' || value === '.') {
                  setFormData(prev => ({ ...prev, balance: 0 }));
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    setFormData(prev => ({ ...prev, balance: numValue }));
                  }
                }
              }
            }}
            pattern="[0-9]*\.?[0-9]*"
            inputMode="decimal"
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
      
      {/* Interest Rate - For debt accounts and savings accounts */}
      {(formData.type === AccountType.CREDIT_CARD || formData.type === AccountType.LOAN || formData.type === AccountType.MORTGAGE || formData.type === AccountType.SAVINGS) && (
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
            Interest Rate (% APR)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="interestRate"
              name="interestRate"
              value={formData.interestRateInput}
              onChange={(e) => {
                const value = e.target.value;
                
                // Allow empty input, single decimal point, or valid numbers (including leading zeros)
                if (value === '' || value === '.' || value === '0' || value === '0.' || !isNaN(parseFloat(value))) {
                  // Always convert to a number, even if it's 0
                  let numValue;
                  if (value === '' || value === '.') {
                    numValue = 0;
                  } else {
                    numValue = parseFloat(value);
                    // Handle NaN case
                    if (isNaN(numValue)) numValue = 0;
                  }
                  
                  setFormData(prev => ({
                    ...prev,
                    interestRateInput: value,
                    interestRate: numValue
                  }));
                  
                  // Log the updated interest rate for debugging
                  console.log('Interest rate updated to:', numValue, 'from input:', value);
                }
              }}
              pattern="[0-9]*\.?[0-9]*"
              inputMode="decimal"
              className="block w-full pr-8 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">%</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {formData.type === AccountType.SAVINGS 
              ? 'Annual percentage yield (APY) for this savings account' 
              : 'Annual percentage rate for this debt (0% for promotional offers)'}
          </p>
        </div>
      )}
      
      {/* Minimum Payment - Only for debt accounts */}
      {(formData.type === AccountType.CREDIT_CARD || formData.type === AccountType.LOAN || formData.type === AccountType.MORTGAGE) && (
        <div>
          <label htmlFor="minimumPayment" className="block text-sm font-medium text-gray-700">
            Minimum Monthly Payment
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="minimumPayment"
              name="minimumPayment"
              value={formData.minimumPaymentInput}
              onChange={(e) => {
                const value = e.target.value;
                
                // Allow empty input, single decimal point, or valid numbers (including leading zeros)
                if (value === '' || value === '.' || value === '0' || value === '0.' || !isNaN(parseFloat(value))) {
                  setFormData(prev => ({
                    ...prev,
                    minimumPaymentInput: value,
                    minimumPayment: value === '' || value === '.' ? 0 : parseFloat(value)
                  }));
                }
              }}
              pattern="[0-9]*\.?[0-9]*"
              inputMode="decimal"
              className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">Required monthly payment for this debt</p>
        </div>
      )}
      
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
          {isSubmitting ? 'Saving...' : (isEdit || (initialData && initialData.id)) ? 'Update Account' : 'Create Account'}
        </button>
      </div>
    </form>
      ) : (
        <div className="space-y-4">
          {savedAccount && (
            <>
              <SavingsBuckets 
                account={savedAccount} 
                onUpdate={handleBucketUpdate} 
              />
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleBucketsDone}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountForm;
