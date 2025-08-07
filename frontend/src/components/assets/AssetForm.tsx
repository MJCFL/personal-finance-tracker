'use client';

import React, { useState, useEffect } from 'react';
import { Asset, AssetCategory, ASSET_CATEGORIES } from '@/types/asset';
import { handleNumberInputChange } from '@/utils/inputHelpers';

interface AssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>) => void;
}

export default function AssetForm({ onSubmit }: AssetFormProps) {
  const [category, setCategory] = useState<AssetCategory>('other');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [value, setValue] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  // Only run client-side code after mounting
  useEffect(() => {
    setMounted(true);
  }, []);



  // Custom handlers for number inputs to fix leading zero issues
  const handleQuantityChange = (value: string) => {
    if (value === '') {
      setQuantity(0);
      return;
    }
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
    }
  };

  const handleValueChange = (value: string) => {
    if (value === '') {
      setValue(0);
      return;
    }
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setValue(numValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const asset = {
      category,
      name,
      value,
      quantity,
    };

    onSubmit(asset);
    
    // Reset form
    setCategory('other');
    setName('');
    setQuantity(1);
    setValue(0);
  };



  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-200">
          Asset Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as AssetCategory);
          }}
          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {ASSET_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          Asset Name
        </label>
        <div className="mt-1 relative">
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-600 rounded-md text-gray-100"
            placeholder="e.g., Downtown Apartment"
          />
        </div>
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-200">
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity === 0 ? '' : quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          min="0"
          step="1"
          className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-200">
          Current Value
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-400 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="value"
            value={value === 0 ? '' : value}
            onChange={(e) => handleValueChange(e.target.value)}
            min="0"
            step="0.01"
            className="pl-7 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Asset
        </button>
      </div>
    </form>
  );
}
