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
      // Safely handle potential non-JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.error || `Failed to fetch investment accounts: ${response.status}`);
      } else {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from server');
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
      // Safely handle potential non-JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.error || `Failed to fetch investment account: ${response.status}`);
      } else {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from server');
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

// Add stock to investment account with lot tracking
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

// Add a new stock lot to an existing stock
export async function addStockLot(
  accountId: string,
  ticker: string,
  lotData: {
    shares: number;
    purchasePrice: number;
    purchaseDate: Date;
    notes?: string;
  }
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/stocks/${ticker}/lots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lotData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add stock lot');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error adding stock lot:', error);
    throw error;
  }
}

// Update a stock lot
export async function updateStockLot(
  accountId: string,
  ticker: string,
  lotId: string,
  lotData: Partial<{
    shares: number;
    purchasePrice: number;
    purchaseDate: Date;
    notes?: string;
  }>
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/stocks/${ticker}/lots/${lotId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lotData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update stock lot');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error updating stock lot:', error);
    throw error;
  }
}

// Remove a stock lot
export async function removeStockLot(
  accountId: string,
  ticker: string,
  lotId: string
): Promise<InvestmentAccountData> {
  try {
    const response = await fetch(`/api/investments/${accountId}/stocks/${ticker}/lots/${lotId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove stock lot');
    }

    const updatedAccount = await response.json();
    
    // Emit event to update financial data
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return updatedAccount;
  } catch (error: any) {
    console.error('Error removing stock lot:', error);
    throw error;
  }
}

// Get historical price data for a stock
export async function getStockHistoricalData(
  ticker: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<{ date: Date; price: number }[]> {
  try {
    const response = await fetch(`/api/stocks/${ticker}/historical?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch historical data');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
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
