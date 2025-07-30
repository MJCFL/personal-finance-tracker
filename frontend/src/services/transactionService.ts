import { TransactionType } from '@/models/Transaction';
import { BudgetCategory } from '@/types/budget';
import { demoTransactionService } from './demoService';
import Cookies from 'js-cookie';

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
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    // Get all transactions from demo service
    const transactions = await demoTransactionService.getTransactions();
    
    // Apply filters if provided
    let filteredTransactions = [...transactions];
    
    if (filters) {
      if (filters.accountId) {
        filteredTransactions = filteredTransactions.filter(t => t.accountId === filters.accountId);
      }
      if (filters.category) {
        filteredTransactions = filteredTransactions.filter(t => t.category === filters.category);
      }
      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
      }
      if (filters.startDate) {
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= filters.endDate!);
      }
    }
    
    // Apply pagination
    const limit = filters?.limit || 20;
    const skip = filters?.skip || 0;
    const paginatedTransactions = filteredTransactions.slice(skip, skip + limit);
    
    return {
      transactions: paginatedTransactions.map(t => {
        // Use type assertion to resolve the Date type issue
        const convertedTransaction = {
          ...t,
          date: new Date(t.date)
        };
        return convertedTransaction as unknown as TransactionData;
      }),
      pagination: {
        total: filteredTransactions.length,
        limit,
        skip,
        hasMore: skip + limit < filteredTransactions.length
      }
    };
  }
  
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.accountId) queryParams.append('accountId', filters.accountId);
    if (filters?.budgetId) queryParams.append('budgetId', filters.budgetId);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) queryParams.append('endDate', filters.endDate.toISOString());
    if (filters?.limit) queryParams.append('limit', String(filters.limit));
    if (filters?.skip) queryParams.append('skip', String(filters.skip));
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // Make API request
    const response = await fetch(`/api/transactions${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch transactions');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Get transaction by ID
export async function getTransactionById(id: string): Promise<TransactionData> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    const transaction = await demoTransactionService.getTransactionById(id);
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    // Convert string date to Date object for TransactionData compatibility
    // Use type assertion to resolve the Date type issue
    const convertedTransaction = {
      ...transaction,
      date: new Date(transaction.date)
    };
    return convertedTransaction as unknown as TransactionData;
  }
  
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch transaction');
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error fetching transaction ${id}:`, error);
    throw error;
  }
}

// Create a new transaction
export async function createTransaction(transactionData: TransactionData): Promise<TransactionData> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    // Add userId for demo service
    const transactionWithUserId = {
      ...transactionData,
      userId: 'demo-user',
      // Convert Date to string if it's a Date object
      date: transactionData.date instanceof Date ? transactionData.date.toISOString() : transactionData.date
    };
    const result = await demoTransactionService.createTransaction(transactionWithUserId as any);
    // Convert string date back to Date object for TransactionData compatibility
    // Use type assertion to resolve the Date type issue
    const convertedTransaction = {
      ...result,
      date: new Date(result.date)
    };
    return convertedTransaction as unknown as TransactionData;
  }
  
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...transactionData,
        date: transactionData.date instanceof Date ? transactionData.date.toISOString() : transactionData.date,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create transaction');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Update an existing transaction
export async function updateTransaction(id: string, transactionData: Partial<TransactionData>): Promise<TransactionData> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    // Convert Date to string if it's a Date object
    const processedData = {
      ...transactionData,
      date: transactionData.date instanceof Date ? transactionData.date.toISOString() : transactionData.date
    };
    const result = await demoTransactionService.updateTransaction(id, processedData as any);
    // Handle null case and convert string date back to Date object for TransactionData compatibility
    if (!result) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    // Use type assertion to resolve the Date type issue
    const convertedTransaction = {
      ...result,
      date: new Date(result.date)
    };
    return convertedTransaction as unknown as TransactionData;
  }
  
  try {
    // Format date if it exists
    const formattedData = { ...transactionData };
    if (formattedData.date instanceof Date) {
      // Use type assertion to handle date conversion
      (formattedData as any).date = formattedData.date.toISOString();
    }

    const response = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update transaction');
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error updating transaction ${id}:`, error);
    throw error;
  }
}

// Delete a transaction
export async function deleteTransaction(id: string): Promise<void> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    await demoTransactionService.deleteTransaction(id);
    return;
  }
  
  try {
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
  } catch (error: any) {
    console.error(`Error deleting transaction ${id}:`, error);
    throw error;
  }
}
