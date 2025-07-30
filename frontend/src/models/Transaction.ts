import mongoose, { Schema } from 'mongoose';
import { BudgetCategory } from './Budget';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export interface TransactionDocument extends mongoose.Document {
  userId: string;
  accountId: string;
  budgetId?: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: BudgetCategory;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account ID is required'],
    },
    budgetId: {
      type: Schema.Types.ObjectId,
      ref: 'Budget',
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
    },
    description: {
      type: String,
      required: [true, 'Transaction description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(BudgetCategory),
      required: [true, 'Transaction category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, accountId: 1 });
TransactionSchema.index({ userId: 1, budgetId: 1 });
TransactionSchema.index({ userId: 1, category: 1 });

export default mongoose.models.Transaction || mongoose.model<TransactionDocument>('Transaction', TransactionSchema);
