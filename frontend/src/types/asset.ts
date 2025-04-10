export type AssetCategory = 'stocks' | 'real_estate' | 'watches' | 'vehicles' | 'art' | 'jewelry' | 'other';

export interface Asset {
  id: string;
  category: AssetCategory;
  name: string;
  quantity?: number; // Only used for stocks
  value: number;
  dateAdded: string;
  lastUpdated: string;
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
