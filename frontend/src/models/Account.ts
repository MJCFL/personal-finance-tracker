import mongoose, { Schema } from 'mongoose';

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  RETIREMENT = 'retirement',
  LOAN = 'loan',
  MORTGAGE = 'mortgage',
  OTHER = 'other',
}

export interface AccountDocument extends mongoose.Document {
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
  accountNumber?: string; // Last 4 digits only for security
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(AccountType),
      required: [true, 'Account type is required'],
    },
    balance: {
      type: Number,
      required: [true, 'Account balance is required'],
      default: 0,
    },
    institution: {
      type: String,
      required: [true, 'Financial institution name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
      maxlength: [4, 'For security, only store last 4 digits of account number'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
AccountSchema.index({ userId: 1, type: 1 });
AccountSchema.index({ userId: 1, isActive: 1 });

export default mongoose.models.Account || mongoose.model<AccountDocument>('Account', AccountSchema);
