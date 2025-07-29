export type AssetCategory = 'stocks' | 'real_estate' | 'watches' | 'vehicles' | 'art' | 'jewelry' | 'other';

export enum AssetType {
  STOCK = 'stock',
  REAL_ESTATE = 'real_estate',
  CASH = 'cash',
  CRYPTO = 'crypto',
  OTHER = 'other',
}

export interface Asset {
  id: string;
  category: AssetCategory;
  name: string;
  quantity?: number; // Only used for stocks
  value: number;
  dateAdded: string;
  lastUpdated: string;
  type?: AssetType; // For analytics purposes
  currentValue?: number; // For analytics purposes, represents the current market value
  purchasePrice?: number; // For analytics purposes, represents the initial purchase price
}

export interface StockAsset extends Asset {
  category: 'stocks';
  quantity: number;
  pricePerShare: number;
}

export const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'watches', label: 'Watches' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'art', label: 'Art' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'other', label: 'Other' },
];
