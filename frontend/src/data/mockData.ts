interface Account {
  id: number;
  name: string;
  institution: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit';
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  account: string;
}

interface Category {
  category: string;
  amount: number;
}

interface MonthlyTotal {
  month: string;
  income: number;
  expenses: number;
}

export const mockTransactions: Transaction[] = [
  {
    id: 1,
    date: '2025-04-06',
    description: 'Grocery Store',
    amount: -82.45,
    category: 'Groceries',
    account: 'Chase Checking'
  },
  {
    id: 2,
    date: '2025-04-05',
    description: 'Monthly Salary',
    amount: 4500.00,
    category: 'Income',
    account: 'Chase Checking'
  },
  {
    id: 3,
    date: '2025-04-05',
    description: 'Netflix Subscription',
    amount: -15.99,
    category: 'Entertainment',
    account: 'Amex Credit Card'
  },
  {
    id: 4,
    date: '2025-04-04',
    description: 'Gas Station',
    amount: -45.30,
    category: 'Transportation',
    account: 'Chase Credit Card'
  },
  {
    id: 5,
    date: '2025-04-03',
    description: 'Restaurant',
    amount: -65.20,
    category: 'Dining',
    account: 'Amex Credit Card'
  }
];

export const mockAccounts: Account[] = [
  {
    id: 1,
    name: 'Chase Checking',
    type: 'checking',
    balance: 3250.45,
    institution: 'Chase'
  },
  {
    id: 2,
    name: 'Chase Savings',
    type: 'savings',
    balance: 12500.00,
    institution: 'Chase'
  },
  {
    id: 3,
    name: 'Chase Credit Card',
    type: 'credit',
    balance: -450.30,
    institution: 'Chase'
  },
  {
    id: 4,
    name: 'Amex Credit Card',
    type: 'credit',
    balance: -800.00,
    institution: 'American Express'
  }
];

export const mockSpendingByCategory: Category[] = [
  { category: 'Groceries', amount: 420.50 },
  { category: 'Transportation', amount: 150.30 },
  { category: 'Entertainment', amount: 95.99 },
  { category: 'Dining', amount: 285.20 },
  { category: 'Utilities', amount: 180.00 }
];

export const mockMonthlyTotals: MonthlyTotal[] = [
  { month: 'Jan', income: 4500, expenses: 3200 },
  { month: 'Feb', income: 4500, expenses: 3400 },
  { month: 'Mar', income: 4500, expenses: 2900 },
  { month: 'Apr', income: 4500, expenses: 3100 }
];
