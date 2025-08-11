import mongoose, { Schema, Document } from 'mongoose';

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

const StockLotSchema = new Schema({
  id: { type: String, required: true },
  ticker: { type: String, required: true, uppercase: true },
  shares: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, required: true, min: 0 },
  purchaseDate: { type: Date, required: true, default: Date.now },
  notes: { type: String },
});

const StockSchema = new Schema({
  ticker: { type: String, required: true, uppercase: true },
  companyName: { type: String, required: true },
  lots: [StockLotSchema],
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

// Virtual for total shares and average buy price per stock
StockSchema.virtual('totalShares').get(function() {
  return this.lots.reduce((total, lot) => total + lot.shares, 0);
});

StockSchema.virtual('avgBuyPrice').get(function() {
  const totalCost = this.lots.reduce((total, lot) => total + (lot.shares * lot.purchasePrice), 0);
  const totalShares = this.lots.reduce((total, lot) => total + lot.shares, 0);
  return totalShares > 0 ? totalCost / totalShares : 0;
});

// Virtual for total value (stocks + cash)
InvestmentAccountSchema.virtual('totalValue').get(function(this: IInvestmentAccount) {
  const stocksValue = this.stocks.reduce((total, stock) => {
    const totalShares = stock.lots.reduce((shares, lot) => shares + lot.shares, 0);
    return total + (totalShares * stock.currentPrice);
  }, 0);
  
  return stocksValue + this.cash;
});

export default mongoose.models.InvestmentAccount || 
  mongoose.model<IInvestmentAccount>('InvestmentAccount', InvestmentAccountSchema);
