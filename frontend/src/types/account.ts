export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  INVESTMENT = 'investment',
  CREDIT_CARD = 'credit_card',
  LOAN = 'loan',
  RETIREMENT = 'retirement',
  MORTGAGE = 'mortgage',
  OTHER = 'other',
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
  accountNumber?: string;
  notes?: string;
  userId: string;
  isActive: boolean;
  interestRate?: number;
}

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: AccountType.CHECKING, label: 'Checking' },
  { value: AccountType.SAVINGS, label: 'Savings' },
  { value: AccountType.INVESTMENT, label: 'Investment' },
  { value: AccountType.CREDIT_CARD, label: 'Credit Card' },
  { value: AccountType.LOAN, label: 'Loan' },
  { value: AccountType.OTHER, label: 'Other' },
];
