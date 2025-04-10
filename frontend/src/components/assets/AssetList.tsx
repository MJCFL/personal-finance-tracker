'use client';

import React from 'react';
import { Asset, ASSET_CATEGORIES } from '@/types/asset';

interface AssetListProps {
  assets: Asset[];
  onDelete?: (id: string) => void;
}

export default function AssetList({ assets, onDelete }: AssetListProps) {
  const getCategoryLabel = (value: string) => {
    return ASSET_CATEGORIES.find(cat => cat.value === value)?.label || value;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              {assets.some(asset => asset.category === 'stocks') && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {getCategoryLabel(asset.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {asset.name}
                </td>
                {assets.some(asset => asset.category === 'stocks') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {asset.category === 'stocks' ? asset.quantity : '-'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatCurrency(asset.value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {onDelete && (
                    <button
                      onClick={() => onDelete(asset.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-800">
            <tr>
              <td colSpan={assets.some(asset => asset.category === 'stocks') ? 3 : 2} className="px-6 py-4 text-sm font-medium text-gray-300">
                Total Assets Value
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-300">
                {formatCurrency(assets.reduce((sum, asset) => sum + asset.value, 0))}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
