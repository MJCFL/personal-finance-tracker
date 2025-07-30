export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType | 'income' | 'expense';
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
