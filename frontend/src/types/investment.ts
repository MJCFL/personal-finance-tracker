export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  REMOVE = 'remove',
  DIVIDEND = 'dividend',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export enum InvestmentAccountType {
  BROKERAGE = 'brokerage',
  RETIREMENT_401K = '401k',
  ROTH_IRA = 'roth_ira',
  TRADITIONAL_IRA = 'traditional_ira',
  EDUCATION_529 = '529',
  HSA = 'hsa',
  OTHER = 'other',
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
