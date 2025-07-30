'use client';

import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Asset, AssetType, AssetCategory, ASSET_CATEGORIES } from '@/types/asset';
import { getAssets } from '@/services/assetService';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define colors for different asset types and categories
const assetTypeColors: Record<AssetType, string> = {
  [AssetType.STOCK]: 'rgba(54, 162, 235, 0.8)',
  [AssetType.REAL_ESTATE]: 'rgba(255, 99, 132, 0.8)',
  [AssetType.CASH]: 'rgba(75, 192, 192, 0.8)',
  [AssetType.CRYPTO]: 'rgba(153, 102, 255, 0.8)',
  [AssetType.OTHER]: 'rgba(255, 159, 64, 0.8)',
};

const assetCategoryColors: Record<string, string> = {
  'stocks': 'rgba(54, 162, 235, 0.8)',
  'real_estate': 'rgba(255, 99, 132, 0.8)',
  'cash': 'rgba(75, 192, 192, 0.8)',
  'crypto': 'rgba(153, 102, 255, 0.8)',
  'watches': 'rgba(255, 206, 86, 0.8)',
  'vehicles': 'rgba(75, 192, 100, 0.8)',
  'art': 'rgba(255, 159, 64, 0.8)',
  'jewelry': 'rgba(200, 100, 200, 0.8)',
  'other': 'rgba(150, 150, 150, 0.8)',
};

export default function AssetAllocationChart() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const fetchedAssets = await getAssets();
        setAssets(fetchedAssets);
      } catch (err) {
        console.error('Failed to fetch assets for chart:', err);
        setError('Failed to load asset data');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Map asset category to AssetType
  const mapCategoryToType = (category: AssetCategory): AssetType => {
    if (category === 'stocks') return AssetType.STOCK;
    if (category === 'real_estate') return AssetType.REAL_ESTATE;
    if (category === 'watches' || category === 'art' || category === 'jewelry' || category === 'vehicles') return AssetType.OTHER;
    return AssetType.OTHER;
  };

  // Calculate total value by asset category
  const calculateAssetAllocation = () => {
    const allocation: Record<string, number> = {};
    
    // Initialize with all possible categories
    ASSET_CATEGORIES.forEach((cat: { value: AssetCategory; label: string }) => {
      allocation[cat.value] = 0;
    });

    assets.forEach((asset) => {
      // Use the actual category of the asset
      const category = asset.category;
      allocation[category] = (allocation[category] || 0) + (asset.currentValue || asset.value || 0);
    });

    // Filter out categories with zero value
    return Object.fromEntries(Object.entries(allocation).filter(([_, value]) => value > 0));
  };

  const allocation = calculateAssetAllocation();

  const chartData = {
    labels: Object.keys(allocation).map(category => {
      // Find the label for this category
      const categoryInfo = ASSET_CATEGORIES.find((cat: { value: AssetCategory; label: string }) => cat.value === category as AssetCategory);
      return categoryInfo ? categoryInfo.label : category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
    }),
    datasets: [
      {
        label: 'Asset Allocation',
        data: Object.values(allocation),
        backgroundColor: Object.keys(allocation).map(category => assetCategoryColors[category] || 'rgba(150, 150, 150, 0.8)'),
        borderColor: Object.keys(allocation).map(category => 
          (assetCategoryColors[category] || 'rgba(150, 150, 150, 0.8)').replace('0.8', '1')
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'white',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 h-80 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 h-80 flex items-center justify-center">
        <p className="text-gray-400">No assets found. Add some assets to see your allocation.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Asset Allocation</h2>
      <div className="h-64">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
