import { TransactionType } from '@/types/commonTypes';
import { BudgetCategory } from '@/types/budget';
import eventEmitter, { FINANCIAL_DATA_CHANGED } from '@/utils/eventEmitter';

export interface TransactionData {
  id?: string;
  accountId: string;
  budgetId?: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: BudgetCategory;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
}

export interface TransactionResponse {
  transactions: TransactionData[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

// Get all transactions with filtering and pagination
export async function getTransactions(filters?: {
  accountId?: string;
  budgetId?: string;
  category?: BudgetCategory;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}): Promise<TransactionResponse> {
  try {
    // Build query string for filters
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.accountId) {
        queryParams.append('accountId', filters.accountId);
      }
      if (filters.budgetId) {
        queryParams.append('budgetId', filters.budgetId);
      }
      if (filters.category) {
        queryParams.append('category', filters.category);
      }
      if (filters.type) {
        queryParams.append('type', filters.type);
      }
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate.toISOString());
      }
      if (filters.limit) {
        queryParams.append('limit', filters.limit.toString());
      }
      if (filters.skip) {
        queryParams.append('skip', filters.skip.toString());
      }
    }
    
    // Make API request to get transactions
    const response = await fetch(`/api/transactions?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    const data = await response.json();
    
    return {
      transactions: data.transactions,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Get transaction by ID
export async function getTransactionById(id: string): Promise<TransactionData> {
  try {
    // Make API request to get transaction by ID
    const response = await fetch(`/api/transactions/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction with ID: ${id}`);
    }
    
    const data = await response.json();
    
    // Convert string date to Date object for TransactionData compatibility
    // Use type assertion to resolve the Date type issue
    const convertedTransaction = {
      ...data,
      date: new Date(data.date)
    };
    
    return convertedTransaction as unknown as TransactionData;
  } catch (error) {
    console.error(`Error fetching transaction with ID ${id}:`, error);
    throw error;
  }
}

// Create a new transaction
export async function createTransaction(transactionData: TransactionData): Promise<TransactionData> {
  try {
    // Make API request to create transaction
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...transactionData,
        date: transactionData.date.toISOString(),
        // Ensure type is one of the valid enum values
        type: transactionData.type === 'income' ? 'income' : 
              transactionData.type === 'expense' ? 'expense' : 
              transactionData.type === 'transfer' ? 'transfer' : 'expense',
        // Ensure amount is a number
        amount: typeof transactionData.amount === 'string' ? 
                parseFloat(transactionData.amount) : transactionData.amount
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create transaction');
    }
    
    const result = await response.json();
    
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return result;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Update an existing transaction
export async function updateTransaction(id: string, transactionData: Partial<TransactionData>): Promise<TransactionData> {
  try {
    // Format date if it exists
    const formattedData = { ...transactionData };
    if (formattedData.date instanceof Date) {
      // Use type assertion to handle date conversion
      (formattedData as any).date = formattedData.date.toISOString();
    }
    
    // Make API request to update transaction
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update transaction');
    }
    
    const result = await response.json();
    
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return result;
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    throw error;
  }
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
  try {
    // Make API request to delete transaction
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete transaction');
    }
    
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
  } catch (error: any) {
    console.error(`Error deleting transaction ${id}:`, error);
    throw error;
  }
}
