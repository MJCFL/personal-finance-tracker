import React, { useState, useEffect } from 'react';
import { createTransaction, updateTransaction, TransactionData } from '@/services/transactionService';
import { getBudgets } from '@/services/budgetService';
import { getAccounts } from '@/services/accountService';
import { BudgetCategory, TransactionType, AccountType } from '@/types/commonTypes';
import { handleStringNumberInputChange } from '@/utils/inputHelpers';

interface TransactionFormData {
  type: TransactionType;
  date: string;
  description: string;
  amount: string;
  category: BudgetCategory;
  accountId: string;
  targetAccountId?: string; // For payment transactions - the account being paid
  budgetId?: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
}

interface AddTransactionModalProps {
  onClose: () => void;
  onTransactionAdded?: () => void;
  accounts: any[];
  transaction?: TransactionData | null;
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
  BudgetCategory.INCOME,
  BudgetCategory.OTHER
];

export default function AddTransactionModal({ onClose, onTransactionAdded, accounts, transaction }: AddTransactionModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: BudgetCategory.OTHER,
    accountId: '',
    targetAccountId: undefined,
    budgetId: undefined,
    isRecurring: false,
    recurringFrequency: undefined,
    tags: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [liabilityAccounts, setLiabilityAccounts] = useState<any[]>([]);
  const [loadingLiabilityAccounts, setLoadingLiabilityAccounts] = useState(false);
  
  // Set default account if available or pre-fill form with transaction data in edit mode
  useEffect(() => {
    if (transaction) {
      // Edit mode - pre-fill form with transaction data
      setFormData({
        type: transaction.type,
        date: new Date(transaction.date).toISOString().split('T')[0],
        description: transaction.description,
        amount: transaction.amount.toString(),
        category: transaction.category,
        accountId: transaction.accountId,
        targetAccountId: (transaction as any).targetAccountId, // Add support for payment transactions
        budgetId: transaction.budgetId,
        isRecurring: transaction.isRecurring,
        recurringFrequency: transaction.recurringFrequency,
        tags: transaction.tags || []
      });
    } else if (accounts.length > 0 && !formData.accountId) {
      // New transaction - set default account
      setFormData(prev => ({
        ...prev,
        accountId: accounts[0].id
      }));
    }
  }, [accounts, transaction]);
  
  // Load available budgets for the selected category
  useEffect(() => {
    const loadBudgets = async () => {
      setLoadingBudgets(true);
      try {
        // Only load budgets for expense transactions
        if (formData.type === TransactionType.EXPENSE) {
          const budgetList = await getBudgets();
          // Filter budgets by category if a category is selected
          const filteredBudgets = formData.category ? 
            budgetList.filter(budget => budget.category === formData.category) : 
            budgetList;
          
          console.log('Loaded budgets for category:', formData.category, filteredBudgets);
          setBudgets(filteredBudgets);
        } else {
          // Clear budgets for non-expense transactions
          setBudgets([]);
        }
      } catch (error) {
        console.error('Error loading budgets:', error);
      } finally {
        setLoadingBudgets(false);
      }
    };
    
    loadBudgets();
  }, [formData.type, formData.category]);
  
  // Load liability accounts for payment transactions
  useEffect(() => {
    const loadLiabilityAccounts = async () => {
      if (formData.type === TransactionType.PAYMENT) {
        setLoadingLiabilityAccounts(true);
        try {
          // Get all accounts and filter for liability types
          const allAccounts = await getAccounts();
          const liabilities = allAccounts.filter(account => 
            account.type === AccountType.CREDIT_CARD || 
            account.type === AccountType.LOAN || 
            account.type === AccountType.MORTGAGE
          );
          
          setLiabilityAccounts(liabilities);
          
          // Set default target account if available
          if (liabilities.length > 0 && !formData.targetAccountId) {
            setFormData(prev => ({
              ...prev,
              targetAccountId: liabilities[0].id,
              category: BudgetCategory.DEBT // Default category for payments
            }));
          }
        } catch (error) {
          console.error('Error loading liability accounts:', error);
        } finally {
          setLoadingLiabilityAccounts(false);
        }
      }
    };
    
    loadLiabilityAccounts();
  }, [formData.type]);

  const handleInputChange = (field: keyof TransactionFormData, value: string | boolean | undefined) => {
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
      
      // Validate payment-specific fields
      if (formData.type === TransactionType.PAYMENT && !formData.targetAccountId) {
        throw new Error('Please select a liability account to pay');
      }
      
      // Create transaction object
      const transactionData = {
        ...formData,
        amount: formData.type === TransactionType.INCOME ? amountValue : Math.abs(amountValue),
        date: new Date(formData.date)
      };
      
      console.log(transaction ? 'Updating transaction:' : 'Creating transaction:', transactionData);
      
      // Submit to API
      if (transaction?.id) {
        // Update existing transaction
        await updateTransaction(transaction.id, transactionData);
      } else {
        // Create new transaction
        await createTransaction(transactionData);
      }
      
      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded();
      }
      
      // Close modal
      onClose();
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || `Failed to ${transaction ? 'update' : 'add'} transaction`);
      setIsSubmitting(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-gray-700 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="flex flex-wrap space-x-4">
            <label className="flex items-center mb-2">
              <input
                type="radio"
                checked={formData.type === TransactionType.EXPENSE}
                onChange={() => handleInputChange('type', TransactionType.EXPENSE)}
                className="mr-2"
              />
              <span className="text-white">Expense</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="radio"
                checked={formData.type === TransactionType.INCOME}
                onChange={() => handleInputChange('type', TransactionType.INCOME)}
                className="mr-2"
              />
              <span className="text-white">Income</span>
            </label>
            <label className="flex items-center mb-2">
              <input
                type="radio"
                checked={formData.type === TransactionType.PAYMENT}
                onChange={() => handleInputChange('type', TransactionType.PAYMENT)}
                className="mr-2"
              />
              <span className="text-white">Payment</span>
            </label>
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-100 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-500"
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
            <label className="block text-sm font-medium text-gray-100 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="block w-full rounded-md border-gray-500 bg-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="block w-full rounded-md border-gray-500 bg-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">
              Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-300 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleStringNumberInputChange(e.target.value, (value) => handleInputChange('amount', value))}
                className="block w-full pl-7 rounded-md border-gray-500 bg-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="block w-full rounded-md border-gray-500 bg-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            <label className="block text-sm font-medium text-gray-100 mb-1">Account</label>
            <select
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Target Account (only for payments) */}
          {formData.type === TransactionType.PAYMENT && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-100 mb-1">Pay To (Liability Account)</label>
              <select
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.targetAccountId || ''}
                onChange={(e) => handleInputChange('targetAccountId', e.target.value)}
                disabled={loadingLiabilityAccounts}
              >
                <option value="">Select liability account</option>
                {liabilityAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} (${account.balance.toLocaleString()})
                  </option>
                ))}
              </select>
              {loadingLiabilityAccounts && (
                <div className="mt-1 text-sm text-blue-400">Loading accounts...</div>
              )}
              {!loadingLiabilityAccounts && liabilityAccounts.length === 0 && (
                <div className="mt-1 text-sm text-yellow-400">No liability accounts found</div>
              )}
            </div>
          )}

          {/* Budget (only for expenses) */}
          {formData.type === TransactionType.EXPENSE && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-100 mb-1">Budget</label>
              <select
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.budgetId || ''}
                onChange={(e) => handleInputChange('budgetId', e.target.value === '' ? undefined : e.target.value)}
                disabled={loadingBudgets}
              >
                <option value="">-- No Budget --</option>
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} (${budget.amount - budget.spent} remaining)
                  </option>
                ))}
              </select>
              {loadingBudgets && (
                <div className="mt-1 text-sm text-blue-400">Loading budgets...</div>
              )}
              {!loadingBudgets && budgets.length === 0 && formData.category && (
                <div className="mt-1 text-sm text-gray-400">No budgets found for this category</div>
              )}
            </div>
          )}

          {/* Recurring Transaction */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="rounded border-gray-500 bg-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-100">Recurring Transaction</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1">
                Frequency
              </label>
              <select
                value={formData.recurringFrequency}
                onChange={(e) => handleInputChange('recurringFrequency', e.target.value)}
                className="block w-full rounded-md border-gray-500 bg-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 border border-gray-600"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  {transaction ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                transaction ? 'Update Transaction' : 'Add Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
