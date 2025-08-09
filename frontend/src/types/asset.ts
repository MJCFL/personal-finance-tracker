export type AssetCategory = 'Real Estate' | 'Watches' | 'Vehicles' | 'Art' | 'Jewelry' | 'Other';

export enum AssetType {
  REAL_ESTATE = 'Real Estate',
  CASH = 'Cash',
  CRYPTO = 'Crypto',
  OTHER = 'Other',
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
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Watches', label: 'Watches' },
  { value: 'Vehicles', label: 'Vehicles' },
  { value: 'Art', label: 'Art' },
  { value: 'Jewelry', label: 'Jewelry' },
  { value: 'Other', label: 'Other' },
];
