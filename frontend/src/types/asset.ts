export type AssetCategory = 'real_estate' | 'watches' | 'vehicles' | 'art' | 'jewelry' | 'other';

export enum AssetType {
  REAL_ESTATE = 'real_estate',
  CASH = 'cash',
  CRYPTO = 'crypto',
  OTHER = 'other',
}

export interface Asset {
  id: string;
  category: AssetCategory;
  name: string;
  quantity?: number;
  value: number;
  dateAdded: string;
  lastUpdated: string;
  type?: AssetType; // For analytics purposes
  currentValue?: number; // For analytics purposes, represents the current market value
  purchasePrice?: number; // For analytics purposes, represents the initial purchase price
}


export const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'watches', label: 'Watches' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'art', label: 'Art' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'other', label: 'Other' },
];
