import mongoose, { Schema } from 'mongoose';

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    currency: string;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    defaultDashboard: string;
  };
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
    settings: {
      currency: {
        type: String,
        default: 'USD',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      defaultDashboard: {
        type: String,
        default: 'overview',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
