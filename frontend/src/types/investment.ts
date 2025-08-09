export enum TransactionType {
  BUY = 'Buy',
  SELL = 'Sell',
  REMOVE = 'Remove',
  DIVIDEND = 'Dividend',
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
}

export enum InvestmentAccountType {
  BROKERAGE = 'Brokerage',
  RETIREMENT_401K = '401(k)',
  ROTH_IRA = 'Roth IRA',
  TRADITIONAL_IRA = 'Traditional IRA',
  EDUCATION_529 = '529 Plan',
  HSA = 'HSA',
  OTHER = 'Other',
}

export interface IStock {
  ticker: string;
  companyName: string;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  lastUpdated: Date;
}

export interface ITransaction {
  type: TransactionType;
  ticker?: string;
  companyName?: string;
  shares?: number;
  price?: number;
  amount: number;
  date: Date;
  notes?: string;
}

export interface IInvestmentAccount {
  id?: string;
  name: string;
  type: InvestmentAccountType;
  institution: string;
  stocks: IStock[];
  cash: number;
  transactions: ITransaction[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
