export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  LOAN = 'loan',
  RETIREMENT = 'retirement',
  MORTGAGE = 'mortgage',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

export interface SavingsBucket {
  id: string;
  name: string;
  amount: number;
  goal?: number;
  isEmergencyFund?: boolean;
  notes?: string;
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
  minimumPayment?: number;
  buckets?: SavingsBucket[];
}

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: AccountType.CHECKING, label: 'Checking' },
  { value: AccountType.SAVINGS, label: 'Savings' },
  { value: AccountType.CREDIT_CARD, label: 'Credit Card' },
  { value: AccountType.LOAN, label: 'Loan' },
  { value: AccountType.RETIREMENT, label: 'Retirement' },
  { value: AccountType.MORTGAGE, label: 'Mortgage' },
  { value: AccountType.INVESTMENT, label: 'Investment' },
  { value: AccountType.OTHER, label: 'Other' },
];
