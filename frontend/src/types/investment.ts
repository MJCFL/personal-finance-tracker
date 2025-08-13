export enum TransactionType {
  BUY = 'Buy',
  SELL = 'Sell',
  REMOVE = 'Remove',
  DIVIDEND = 'Dividend',
  DEPOSIT = 'Deposit',
  WITHDRAWAL = 'Withdrawal',
  MINING = 'Mining',
  STAKING = 'Staking'
}

export enum InvestmentAccountType {
  BROKERAGE = 'Brokerage',
  RETIREMENT_401K = '401(k)',
  ROTH_IRA = 'Roth IRA',
  TRADITIONAL_IRA = 'Traditional IRA',
  EDUCATION_529 = '529 Plan',
  HSA = 'HSA',
  CRYPTO_WALLET = 'CryptoWallet', // Changed from 'Crypto Wallet' to 'CryptoWallet' to avoid space in enum value
  OTHER = 'Other',
}

export interface IStockLot {
  id: string;
  ticker: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: Date;
  notes?: string;
}

export interface IStock {
  ticker: string;
  companyName: string;
  lots: IStockLot[];
  currentPrice: number;
  lastUpdated: Date;
  // Calculated fields
  totalShares?: number;
  avgBuyPrice?: number;
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

export interface ICryptoLot {
  id: string;
  symbol: string;
  amount: number;
  purchasePrice: number;
  purchaseDate: Date;
  notes?: string;
}

export interface ICrypto {
  symbol: string;
  name: string;
  lots: ICryptoLot[];
  currentPrice: number;
  lastUpdated: Date;
  // Calculated fields
  totalAmount?: number;
  avgBuyPrice?: number;
}

export interface IInvestmentAccount {
  id?: string;
  name: string;
  type: InvestmentAccountType;
  institution: string;
  stocks: IStock[];
  cryptos?: ICrypto[];
  cash: number;
  transactions: ITransaction[];
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
