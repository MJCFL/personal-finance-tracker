'use client';

import React, { useState, useEffect } from 'react';
import { Asset } from '@/types/asset';
import AssetForm from '@/components/assets/AssetForm';
import AssetList from '@/components/assets/AssetList';
import { getAssets, createAsset, deleteAsset } from '@/services/assetService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const assetsData = await getAssets();
        setAssets(assetsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch assets:', err);
        setError('Failed to load assets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const handleAddAsset = async (newAsset: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    try {
      setError(null);
      const asset = await createAsset(newAsset);
      setAssets([...assets, asset]);
      setSuccessMessage(`${newAsset.name} added successfully!`);
    } catch (err) {
      console.error('Failed to add asset:', err);
      setError('Failed to add asset. Please try again.');
      setSuccessMessage(null);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      setError(null);
      const assetToDelete = assets.find(asset => asset.id === id);
      await deleteAsset(id);
      setAssets(assets.filter(asset => asset.id !== id));
      setSuccessMessage(`${assetToDelete?.name || 'Asset'} deleted successfully!`);
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError('Failed to delete asset. Please try again.');
      setSuccessMessage(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-100">Assets</h1>
          
          <ErrorMessage 
            message={error} 
            onDismiss={() => setError(null)} 
            className="mb-6" 
          />
          
          <SuccessMessage 
            message={successMessage} 
            onDismiss={() => setSuccessMessage(null)} 
            className="mb-6" 
          />
          
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Add New Asset</h2>
            <AssetForm onSubmit={handleAddAsset} />
          </div>

          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Assets</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : assets.length > 0 ? (
              <AssetList assets={assets} onDelete={handleDeleteAsset} />
            ) : (
              <p className="text-gray-400 py-4">No assets found. Add your first asset above.</p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
