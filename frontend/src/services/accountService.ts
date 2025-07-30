import { AccountType } from '@/types/account';
import { demoAccountService } from './demoService';
import Cookies from 'js-cookie';

export interface AccountData {
  id?: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
  accountNumber?: string;
  isActive: boolean;
  notes?: string;
}

// Get all accounts
export async function getAccounts(filters?: {
  type?: AccountType;
  isActive?: boolean;
}): Promise<AccountData[]> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    const accounts = await demoAccountService.getAccounts();
    // Apply filters if provided
    if (filters) {
      return accounts.filter(account => {
        if (filters.type && account.type !== filters.type) return false;
        if (filters.isActive !== undefined && account.isActive !== filters.isActive) return false;
        return true;
      });
    }
    return accounts;
  }
  
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
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    const account = await demoAccountService.getAccountById(id);
    if (!account) {
      throw new Error(`Account with ID ${id} not found`);
    }
    return account;
  }
  
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
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    // Add userId for demo service
    const accountWithUserId = {
      ...accountData,
      userId: 'demo-user'
    };
    return demoAccountService.createAccount(accountWithUserId);
  }
  
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

    return await response.json();
  } catch (error: any) {
    console.error('Error creating account:', error);
    throw error;
  }
}

// Update an existing account
export async function updateAccount(id: string, accountData: Partial<AccountData>): Promise<AccountData> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    const result = await demoAccountService.updateAccount(id, accountData as any);
    if (!result) {
      throw new Error(`Account with ID ${id} not found`);
    }
    return result;
  }
  
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

    return await response.json();
  } catch (error: any) {
    console.error(`Error updating account ${id}:`, error);
    throw error;
  }
}

// Delete an account
export async function deleteAccount(id: string): Promise<void> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    await demoAccountService.deleteAccount(id);
    return;
  }
  
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
  } catch (error: any) {
    console.error(`Error deleting account ${id}:`, error);
    throw error;
  }
}
