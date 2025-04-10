'use client';

import React, { useState } from 'react';
import { Asset } from '@/types/asset';
import AssetForm from '@/components/assets/AssetForm';
import AssetList from '@/components/assets/AssetList';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);

  const handleAddAsset = (newAsset: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    const asset: Asset = {
      ...newAsset,
      id: Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setAssets([...assets, asset]);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-100">Assets</h1>
        
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Add New Asset</h2>
          <AssetForm onSubmit={handleAddAsset} />
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Assets</h2>
          <AssetList assets={assets} onDelete={handleDeleteAsset} />
        </div>
      </div>
    </div>
  );
}
