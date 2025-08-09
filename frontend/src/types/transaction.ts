export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  TRANSFER = 'Transfer'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType | 'Income' | 'Expense';
  source?: string;
  notes?: string;
  account?: string;
  accountId: string;
  budgetId?: string;
  tags?: string[];
  userId: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
