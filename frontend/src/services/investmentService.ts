import { InvestmentAccountType, IStock, ITransaction, TransactionType } from '@/types/investment';
import eventEmitter, { FINANCIAL_DATA_CHANGED } from '@/utils/eventEmitter';

export interface InvestmentAccountData {
  id?: string;
  name: string;
  type: InvestmentAccountType;
  institution: string;
  stocks: IStock[];
  cash: number;
  transactions: ITransaction[];
}

// Get all investment accounts
export async function getInvestmentAccounts(): Promise<InvestmentAccountData[]> {
  try {
    const response = await fetch('/api/investments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch investment accounts');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching investment accounts:', error);
    throw error;
  }
}

// Get investment account by ID
export async function getInvestmentAccountById(id: string): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch investment account');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching investment account:', error);
    throw error;
  }
}

// Create a new investment account
export async function createInvestmentAccount(accountData: InvestmentAccountData): Promise<InvestmentAccountData> {
  try {
    const response = await fetch('/api/investments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create investment account');
    }

    const newAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return newAccount;
  } catch (error: any) {
    console.error('Error creating investment account:', error);
    throw error;
  }
}

// Update an existing investment account
export async function updateInvestmentAccount(
  id: string, 
  accountData: Partial<InvestmentAccountData>
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update investment account');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error updating investment account:', error);
    throw error;
  }
}

// Delete an investment account
export async function deleteInvestmentAccount(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/investments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete investment account');
    }
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
  } catch (error: any) {
    console.error('Error deleting investment account:', error);
    throw error;
  }
}

// Add stock to investment account
export async function addStock(
  accountId: string, 
  stockData: IStock
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/stocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add stock');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error adding stock:', error);
    throw error;
  }
}

// Update stock in investment account
export async function updateStock(
  accountId: string,
  ticker: string,
  stockData: Partial<IStock>
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/stocks/${ticker}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update stock');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error updating stock:', error);
    throw error;
  }
}

// Remove stock from investment account
export async function removeStock(
  accountId: string,
  ticker: string
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/stocks/${ticker}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove stock');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error removing stock:', error);
    throw error;
  }
}

// Add transaction to investment account
export async function addTransaction(
  accountId: string,
  transactionData: ITransaction
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add transaction');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

// Get stock price from API
export async function getStockPrice(ticker: string): Promise<number> {
  try {
    const response = await fetch(`/api/stocks/price?ticker=${ticker}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stock price');
    }

    const data = await response.json();
    return data.price;
  } catch (error: any) {
    console.error('Error fetching stock price:', error);
    throw error;
  }
}

// Calculate new average buy price when adding more shares
export function calculateNewAverageBuyPrice(
  currentShares: number,
  currentAvgPrice: number,
  newShares: number,
  newPrice: number
): number {
  const totalShares = currentShares + newShares;
  const totalCost = (currentShares * currentAvgPrice) + (newShares * newPrice);
  return totalCost / totalShares;
}

// Sell stock from investment account
export async function sellStock(
  accountId: string,
  saleData: {
    ticker: string;
    companyName: string;
    shares: number;
    price: number;
  }
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sell stock');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error selling stock:', error);
    throw error;
  }
}

// Update cash balance in investment account
export async function updateCashBalance(
  accountId: string,
  newBalance: number
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/cash`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cash: newBalance }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update cash balance');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error updating cash balance:', error);
    throw error;
  }
}

// Record cash transaction (deposit or withdrawal)
export async function recordCashTransaction(
  accountId: string,
  transactionData: {
    type: TransactionType.DEPOSIT | TransactionType.WITHDRAWAL;
    amount: number;
    date: Date;
    notes?: string;
  }
): Promise<InvestmentAccountData> {
  try {
    // Create transaction object
    const transaction: ITransaction = {
      ...transactionData,
      amount: transactionData.amount,
    };

    // Add transaction to account
    return await addTransaction(accountId, transaction);
  } catch (error: any) {
    console.error('Error recording cash transaction:', error);
    throw error;
  }
}

// Search for stocks by ticker or company name
export async function searchStocks(query: string): Promise<any[]> {
  try {
    const response = await fetch(`/api/stocks/search?query=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search stocks');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error searching stocks:', error);
    throw error;
  }
}
