import mongoose, { Schema, Document } from 'mongoose';

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

export interface IInvestmentAccount extends Document {
  name: string;
  type: InvestmentAccountType;
  institution: string;
  stocks: IStock[];
  cash: number;
  transactions: ITransaction[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockSchema = new Schema({
  ticker: { type: String, required: true, uppercase: true },
  companyName: { type: String, required: true },
  shares: { type: Number, required: true, min: 0 },
  avgBuyPrice: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, required: true, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const TransactionSchema = new Schema({
  type: { type: String, required: true, enum: Object.values(TransactionType) },
  ticker: { type: String, uppercase: true },
  companyName: { type: String },
  shares: { type: Number, min: 0 },
  price: { type: Number, min: 0 },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String },
});

const InvestmentAccountSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: Object.values(InvestmentAccountType),
    },
    institution: { type: String, required: true },
    stocks: [StockSchema],
    cash: { type: Number, default: 0, min: 0 },
    transactions: [TransactionSchema],
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

// Virtual for total value (stocks + cash)
InvestmentAccountSchema.virtual('totalValue').get(function(this: IInvestmentAccount) {
  const stocksValue = this.stocks.reduce((total, stock) => {
    return total + (stock.shares * stock.currentPrice);
  }, 0);
  
  return stocksValue + this.cash;
});

export default mongoose.models.InvestmentAccount || 
  mongoose.model<IInvestmentAccount>('InvestmentAccount', InvestmentAccountSchema);
