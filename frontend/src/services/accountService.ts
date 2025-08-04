import { AccountType } from '@/types/account';
import eventEmitter, { FINANCIAL_DATA_CHANGED } from '@/utils/eventEmitter';

export interface AccountData {
  id?: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
  accountNumber?: string;
  isActive: boolean;
  notes?: string;
  interestRate?: number;
}

// Get all accounts
export async function getAccounts(filters?: {
  type?: AccountType;
  isActive?: boolean;
}): Promise<AccountData[]> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // Make API request
    const response = await fetch(`/api/accounts${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch accounts');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
}

// Get account by ID
export async function getAccountById(id: string): Promise<AccountData> {
  try {
    const response = await fetch(`/api/accounts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch account');
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error fetching account ${id}:`, error);
    throw error;
  }
}

// Create a new account
export async function createAccount(accountData: AccountData): Promise<AccountData> {
  try {
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create account');
    }

    const result = await response.json();
    
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return result;
  } catch (error: any) {
    console.error('Error creating account:', error);
    throw error;
  }
}

// Update an existing account
export async function updateAccount(id: string, accountData: Partial<AccountData>): Promise<AccountData> {
  try {
    const response = await fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update account');
    }

    const result = await response.json();
    
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return result;
  } catch (error: any) {
    console.error(`Error updating account ${id}:`, error);
    throw error;
  }
}

// Delete an account
export async function deleteAccount(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete account');
    }
    
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
  } catch (error: any) {
    console.error(`Error deleting account ${id}:`, error);
    throw error;
  }
}
