// Demo service to provide in-memory data for demo mode
import { Asset, AssetType } from '../types/asset';
import { Account, AccountType } from '../types/account';
import { Transaction, TransactionType } from '../types/transaction';

// Extended asset type for demo purposes
interface DemoAsset extends Asset {
  ticker?: string;
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  location?: string;
  institution?: string;
  notes?: string;
  userId: string;
}

// Sample demo data
const demoAssets: DemoAsset[] = [
  {
    id: 'demo-asset-1',
    name: 'Apple Inc.',
    type: AssetType.STOCK,
    category: 'stocks',
    value: 15000,
    dateAdded: new Date('2023-01-15').toISOString(),
    lastUpdated: new Date().toISOString(),
    ticker: 'AAPL',
    quantity: 100,
    purchasePrice: 150,
    purchaseDate: new Date('2023-01-15').toISOString(),
    notes: 'Long-term investment in tech sector',
    userId: 'demo-user'
  },
  {
    id: 'demo-asset-2',
    name: 'Rental Property',
    type: AssetType.REAL_ESTATE,
    category: 'real_estate',
    value: 350000,
    dateAdded: new Date('2020-06-10').toISOString(),
    lastUpdated: new Date().toISOString(),
    location: '123 Main St, Anytown, USA',
    purchasePrice: 300000,
    purchaseDate: new Date('2020-06-10').toISOString(),
    notes: 'Rental property with positive cash flow',
    userId: 'demo-user'
  },
  {
    id: 'demo-asset-3',
    name: 'Emergency Fund',
    type: AssetType.CASH,
    category: 'other',
    value: 25000,
    dateAdded: new Date('2022-12-01').toISOString(),
    lastUpdated: new Date().toISOString(),
    institution: 'Bank of America',
    notes: '6 months of living expenses',
    userId: 'demo-user'
  },
  {
    id: 'demo-asset-4',
    name: 'Tesla Inc.',
    type: AssetType.STOCK,
    category: 'stocks',
    value: 20000,
    dateAdded: new Date('2022-03-20').toISOString(),
    lastUpdated: new Date().toISOString(),
    ticker: 'TSLA',
    quantity: 25,
    purchasePrice: 800,
    purchaseDate: new Date('2022-03-20').toISOString(),
    notes: 'Growth stock investment',
    userId: 'demo-user'
  }
];

const demoAccounts: Account[] = [
  {
    id: 'demo-account-1',
    name: 'Checking Account',
    type: AccountType.CHECKING,
    balance: 5000,
    institution: 'Chase Bank',
    notes: 'Primary checking account',
    userId: 'demo-user',
    isActive: true
  },
  {
    id: 'demo-account-2',
    name: 'Savings Account',
    type: AccountType.SAVINGS,
    balance: 25000,
    institution: 'Bank of America',
    notes: 'Emergency fund',
    userId: 'demo-user',
    isActive: true
  },
  {
    id: 'demo-account-3',
    name: 'Investment Account',
    type: AccountType.INVESTMENT,
    isActive: true,
    balance: 150000,
    institution: 'Fidelity',
    notes: 'Retirement investments',
    userId: 'demo-user'
  }
];

const demoTransactions: Transaction[] = [
  {
    id: 'demo-transaction-1',
    description: 'Grocery Shopping',
    amount: -120.50,
    date: new Date('2023-07-15').toISOString(),
    type: TransactionType.EXPENSE,
    category: 'Food',
    source: 'Walmart',
    tags: ['groceries', 'essentials'],
    accountId: 'demo-account-1',
    account: 'Checking Account',
    userId: 'demo-user',
    isRecurring: false
  },
  {
    id: 'demo-transaction-2',
    description: 'Salary Deposit',
    amount: 3500,
    date: new Date('2023-07-01').toISOString(),
    type: TransactionType.INCOME,
    category: 'Salary',
    source: 'Employer',
    tags: ['work', 'monthly'],
    accountId: 'demo-account-1',
    account: 'Checking Account',
    userId: 'demo-user',
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: 'demo-transaction-3',
    description: 'Rent Payment',
    amount: -1200,
    date: new Date('2023-07-05').toISOString(),
    type: TransactionType.EXPENSE,
    category: 'Housing',
    source: 'Landlord',
    tags: ['rent', 'monthly'],
    accountId: 'demo-account-1',
    account: 'Checking Account',
    userId: 'demo-user',
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: 'demo-transaction-4',
    description: 'Stock Dividend',
    amount: 250,
    date: new Date('2023-07-10').toISOString(),
    type: TransactionType.INCOME,
    category: 'Investment',
    source: 'Fidelity',
    tags: ['dividend', 'passive'],
    accountId: 'demo-account-3',
    account: 'Investment Account',
    userId: 'demo-user',
    isRecurring: false
  },
  {
    id: 'demo-transaction-5',
    description: 'Utilities Bill',
    amount: -85.75,
    date: new Date('2023-07-12').toISOString(),
    type: TransactionType.EXPENSE,
    category: 'Utilities',
    isRecurring: true,
    recurringFrequency: 'monthly',
    source: 'Electric Company',
    tags: ['bills', 'monthly'],
    accountId: 'demo-account-1',
    account: 'Checking Account',
    userId: 'demo-user'
  }
];

// In-memory storage for demo mode
let assets = [...demoAssets];
let accounts = [...demoAccounts];
let transactions = [...demoTransactions];

// Asset service methods
export const demoAssetService = {
  // Get all assets
  getAssets: async () => {
    return assets;
  },
  
  // Get asset by ID
  getAssetById: async (id: string) => {
    return assets.find(asset => asset.id === id);
  },
  
  // Create asset
  createAsset: async (asset: Omit<Asset, 'id'>) => {
    const newAsset = {
      ...asset,
      id: `demo-asset-${Date.now()}`,
      userId: 'demo-user',
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    assets.push(newAsset as DemoAsset);
    return newAsset;
  },
  
  // Update asset
  updateAsset: async (id: string, asset: Partial<Asset>) => {
    const index = assets.findIndex(a => a.id === id);
    if (index !== -1) {
      assets[index] = { 
        ...assets[index], 
        ...asset, 
        lastUpdated: new Date().toISOString() 
      };
      return assets[index];
    }
    return null;
  },
  
  // Delete asset
  deleteAsset: async (id: string) => {
    const index = assets.findIndex(a => a.id === id);
    if (index !== -1) {
      const deleted = assets[index];
      assets = assets.filter(a => a.id !== id);
      return deleted;
    }
    return null;
  }
};

// Account service methods
export const demoAccountService = {
  // Get all accounts
  getAccounts: async () => {
    return accounts;
  },
  
  // Get account by ID
  getAccountById: async (id: string) => {
    return accounts.find(account => account.id === id);
  },
  
  // Create account
  createAccount: async (account: Omit<Account, 'id' | 'userId'>) => {
    const newAccount = {
      ...account,
      id: `demo-account-${Date.now()}`,
      userId: 'demo-user'
    };
    accounts.push(newAccount as Account);
    return newAccount;
  },
  
  // Update account
  updateAccount: async (id: string, account: Partial<Account>) => {
    const index = accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      accounts[index] = { ...accounts[index], ...account };
      return accounts[index];
    }
    return null;
  },
  
  // Delete account
  deleteAccount: async (id: string) => {
    const index = accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      const deleted = accounts[index];
      accounts = accounts.filter(a => a.id !== id);
      // Also delete associated transactions
      transactions = transactions.filter(t => t.accountId !== id);
      return deleted;
    }
    return null;
  }
};

// Transaction service methods
export const demoTransactionService = {
  // Get all transactions
  getTransactions: async () => {
    return transactions;
  },
  
  // Get transaction by ID
  getTransactionById: async (id: string) => {
    return transactions.find(transaction => transaction.id === id);
  },
  
  // Create transaction
  createTransaction: async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    const newTransaction = {
      ...transaction,
      id: `demo-transaction-${Date.now()}`,
      userId: 'demo-user'
    };
    transactions.push(newTransaction as Transaction);
    
    // Update account balance
    const accountIndex = accounts.findIndex(a => a.id === transaction.accountId);
    if (accountIndex !== -1) {
      accounts[accountIndex].balance += transaction.amount;
    }
    
    return newTransaction;
  },
  
  // Update transaction
  updateTransaction: async (id: string, transaction: Partial<Transaction>) => {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      // If amount is changing, update account balance
      if (transaction.amount !== undefined && transaction.amount !== transactions[index].amount) {
        const accountId = transactions[index].accountId;
        const accountIndex = accounts.findIndex(a => a.id === accountId);
        if (accountIndex !== -1) {
          // Remove old amount and add new amount
          accounts[accountIndex].balance -= transactions[index].amount;
          accounts[accountIndex].balance += transaction.amount;
        }
      }
      
      transactions[index] = { ...transactions[index], ...transaction };
      return transactions[index];
    }
    return null;
  },
  
  // Delete transaction
  deleteTransaction: async (id: string) => {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const deleted = transactions[index];
      
      // Update account balance
      const accountIndex = accounts.findIndex(a => a.id === deleted.accountId);
      if (accountIndex !== -1) {
        accounts[accountIndex].balance -= deleted.amount;
      }
      
      transactions = transactions.filter(t => t.id !== id);
      return deleted;
    }
    return null;
  },
  
  // Delete multiple transactions
  deleteTransactions: async (ids: string[]) => {
    const deletedTransactions = [];
    
    for (const id of ids) {
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        const deleted = transactions[index];
        
        // Update account balance
        const accountIndex = accounts.findIndex(a => a.id === deleted.accountId);
        if (accountIndex !== -1) {
          accounts[accountIndex].balance -= deleted.amount;
        }
        
        deletedTransactions.push(deleted);
      }
    }
    
    transactions = transactions.filter(t => !ids.includes(t.id));
    return deletedTransactions;
  }
};

// Reset demo data to initial state
export const resetDemoData = () => {
  assets = [...demoAssets];
  accounts = [...demoAccounts];
  transactions = [...demoTransactions];
};
