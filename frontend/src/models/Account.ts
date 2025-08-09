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

export interface SavingsBucketDocument {
  name: string;
  amount: number;
  goal?: number;
  isEmergencyFund?: boolean;
  notes?: string;
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
  interestRate?: number; // Annual interest rate (APR) as a percentage
  minimumPayment?: number; // Minimum monthly payment amount
  buckets?: SavingsBucketDocument[];
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
    interestRate: {
      type: Number,
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%'],
      default: 0,  // Always default to 0 instead of undefined
      set: function(v: any) {
        // Always convert to number and ensure it's not undefined
        if (v === undefined || v === null) return 0;
        const num = Number(v);
        return isNaN(num) ? 0 : num;
      },
      get: function(v: any) {
        // Always return a number, never undefined
        if (v === undefined || v === null) return 0;
        const num = Number(v);
        return isNaN(num) ? 0 : num;
      }
    },
    minimumPayment: {
      type: Number,
      min: [0, 'Minimum payment cannot be negative'],
    },
    buckets: {
      type: [{
        name: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        goal: { type: Number, min: 0 },
        isEmergencyFund: { type: Boolean, default: false },
        notes: { type: String }
      }],
      default: [],
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
