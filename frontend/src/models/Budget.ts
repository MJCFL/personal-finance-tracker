import mongoose, { Schema } from 'mongoose';
import { BudgetCategory } from '../types/commonTypes';

export interface Budget {
  id: string;
  userId: string;
  name: string;
  category: BudgetCategory;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly' | 'weekly';
  startDate: Date;
  endDate?: Date;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(BudgetCategory),
      required: [true, 'Budget category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget amount cannot be negative'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly', 'weekly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Budget model
export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
