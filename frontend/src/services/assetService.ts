import { Asset } from '@/types/asset';

// Fetch all assets
export async function getAssets(): Promise<Asset[]> {
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
