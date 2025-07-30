import { Asset } from '@/types/asset';
import { demoAssetService } from './demoService';
import Cookies from 'js-cookie';

// Fetch all assets
export async function getAssets(): Promise<Asset[]> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    return demoAssetService.getAssets();
  }
  
  try {
    const response = await fetch('/api/assets');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch assets');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

// Create a new asset
export async function createAsset(assetData: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>): Promise<Asset> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    // Add required fields for demo service
    const assetWithDates = {
      ...assetData,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    return demoAssetService.createAsset(assetWithDates);
  }
  
  try {
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assetData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create asset');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating asset:', error);
    throw error;
  }
}

// Update an existing asset
export async function updateAsset(id: string, assetData: Partial<Asset>): Promise<Asset> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    const result = await demoAssetService.updateAsset(id, assetData);
    if (!result) {
      throw new Error('Asset not found');
    }
    return result;
  }
  
  try {
    const response = await fetch(`/api/assets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assetData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update asset');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
}

// Delete an asset
export async function deleteAsset(id: string): Promise<void> {
  // Check if in demo mode
  if (Cookies.get('demoMode') === 'true') {
    const result = await demoAssetService.deleteAsset(id);
    if (!result) {
      throw new Error('Asset not found');
    }
    return;
  }
  
  try {
    const response = await fetch(`/api/assets/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete asset');
    }
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
}
