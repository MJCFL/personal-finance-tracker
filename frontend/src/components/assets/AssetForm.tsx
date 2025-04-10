'use client';

import React, { useState, useEffect } from 'react';
import { Asset, AssetCategory, ASSET_CATEGORIES } from '@/types/asset';
import { getStockQuote } from '@/services/stockService';
import debounce from 'lodash/debounce';

interface AssetFormProps {
  onSubmit: (asset: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>) => void;
}

export default function AssetForm({ onSubmit }: AssetFormProps) {
  const [category, setCategory] = useState<AssetCategory>('other');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [value, setValue] = useState<number>(0);
  const [stockPrice, setStockPrice] = useState<number | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only run client-side code after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced function to fetch stock data
  const debouncedFetchStock = React.useMemo(
    () =>
      debounce(async (symbol: string) => {
        if (!symbol) return;
        
        setIsLoadingStock(true);
        setStockError(null);
        
        try {
          const quote = await getStockQuote(symbol);
          setStockPrice(quote.price);
          setName(quote.name); // Update name with full company name
          // Update total value based on quantity and price
          setValue(quote.price * quantity);
        } catch (error) {
          setStockError('Stock not found');
          setStockPrice(null);
        } finally {
          setIsLoadingStock(false);
        }
      }, 500),
    [quantity]
  );

  // Effect to update value when stock price or quantity changes
  useEffect(() => {
    if (category === 'stocks' && stockPrice !== null) {
      setValue(stockPrice * quantity);
    }
  }, [category, stockPrice, quantity]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetchStock.cancel();
    };
  }, [debouncedFetchStock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const asset = {
      category,
      name,
      value,
      ...(category === 'stocks' && { 
        quantity,
        pricePerShare: stockPrice || value / quantity 
      }),
    };

    onSubmit(asset);
    
    // Reset form
    setCategory('other');
    setName('');
    setQuantity(1);
    setValue(0);
    setStockPrice(null);
    setStockError(null);
  };

  const handleStockSymbolChange = (symbol: string) => {
    if (category === 'stocks' && mounted) {
      debouncedFetchStock(symbol);
    }
    setName(symbol);
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
            setStockPrice(null);
            setStockError(null);
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-200">
          {category === 'stocks' ? 'Stock Symbol' : 'Asset Name'}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => handleStockSymbolChange(e.target.value)}
            className="block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder={category === 'stocks' ? 'e.g., AAPL' : 'e.g., Downtown Apartment'}
          />
          {isLoadingStock && (
            <p className="mt-1 text-sm text-gray-400">Loading stock data...</p>
          )}
          {stockError && (
            <p className="mt-1 text-sm text-red-500">{stockError}</p>
          )}
          {stockPrice && (
            <p className="mt-1 text-sm text-green-500">
              Current Price: ${stockPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {category === 'stocks' && (
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-200">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="0"
            step="1"
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-200">
          {category === 'stocks' ? 'Total Value (Auto-calculated)' : 'Current Value'}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-400 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="value"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            min="0"
            step="0.01"
            readOnly={category === 'stocks'}
            className={`pl-7 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              category === 'stocks' ? 'cursor-not-allowed bg-gray-700' : ''
            }`}
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
