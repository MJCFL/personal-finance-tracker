export enum BudgetCategory {
  HOUSING = 'housing',
  TRANSPORTATION = 'transportation',
  FOOD = 'food',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  HEALTHCARE = 'healthcare',
  SAVINGS = 'savings',
  PERSONAL = 'personal',
  ENTERTAINMENT = 'entertainment',
  DEBT = 'debt',
  EDUCATION = 'education',
  GIFTS = 'gifts',
  OTHER = 'other',
}

export type BudgetPeriod = 'monthly' | 'yearly' | 'weekly';

export interface Budget {
  id: string;
  userId: string;
  name: string;
  category: BudgetCategory;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  isRecurring: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface BudgetFormData {
  name: string;
  category: BudgetCategory;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
}

export const BUDGET_CATEGORIES: { value: BudgetCategory; label: string }[] = [
  { value: BudgetCategory.HOUSING, label: 'Housing' },
  { value: BudgetCategory.TRANSPORTATION, label: 'Transportation' },
  { value: BudgetCategory.FOOD, label: 'Food & Groceries' },
  { value: BudgetCategory.UTILITIES, label: 'Utilities' },
  { value: BudgetCategory.INSURANCE, label: 'Insurance' },
  { value: BudgetCategory.HEALTHCARE, label: 'Healthcare' },
  { value: BudgetCategory.SAVINGS, label: 'Savings & Investments' },
  { value: BudgetCategory.PERSONAL, label: 'Personal Care' },
  { value: BudgetCategory.ENTERTAINMENT, label: 'Entertainment' },
  { value: BudgetCategory.DEBT, label: 'Debt Payments' },
  { value: BudgetCategory.EDUCATION, label: 'Education' },
  { value: BudgetCategory.GIFTS, label: 'Gifts & Donations' },
  { value: BudgetCategory.OTHER, label: 'Other' },
];
