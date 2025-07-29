import mongoose from 'mongoose';
import { ASSET_CATEGORIES } from '@/types/asset';

// Extract the category values from ASSET_CATEGORIES for enum validation
const assetCategoryValues = ASSET_CATEGORIES.map(category => category.value);

// Create Asset Schema
const AssetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please specify an asset category'],
    enum: assetCategoryValues
  },
  name: {
    type: String,
    required: [true, 'Please provide an asset name'],
    trim: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  value: {
    type: Number,
    required: [true, 'Please provide an asset value']
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // Additional fields for stocks
  symbol: {
    type: String,
    trim: true,
    uppercase: true
  },
  price: {
    type: Number
  },
  // User reference for multi-user support
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  }
});

// Prevent model compilation error in development due to hot reloading
export default mongoose.models.Asset || mongoose.model('Asset', AssetSchema);
