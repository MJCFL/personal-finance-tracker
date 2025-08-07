'use client';

import React, { useState } from 'react';
import { IStock } from '@/models/InvestmentAccount';
import { sellStock } from '@/services/investmentService';
import { handleStringNumberInputChange } from '@/utils/inputHelpers';
import Modal from '../ui/Modal';

interface SellStockModalProps {
  accountId: string;
  stock: IStock;
  onClose: () => void;
  onStockSold: () => void;
}

const SellStockModal: React.FC<SellStockModalProps> = ({
  accountId,
  stock,
  onClose,
  onStockSold,
}) => {
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState(stock.currentPrice.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total value
  const calculateTotalValue = (): number => {
    const sharesNum = parseFloat(shares) || 0;
    const priceNum = parseFloat(price) || 0;
    return sharesNum * priceNum;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate inputs
      const sharesNum = parseFloat(shares);
      if (isNaN(sharesNum) || sharesNum <= 0) {
        throw new Error('Please enter a valid number of shares');
      }
      
      if (sharesNum > stock.shares) {
        throw new Error(`You only have ${stock.shares} shares to sell`);
      }
      
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Please enter a valid price');
      }
      
      // Sell stock
      await sellStock(accountId, {
        ticker: stock.ticker,
        companyName: stock.companyName,
        shares: sharesNum,
        price: priceNum,
      });
      
      onStockSold();
    } catch (err: any) {
      setError(err.message || 'Failed to sell stock');
      console.error('Error selling stock:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Sell ${stock.ticker} Shares`} onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold">{stock.ticker}</div>
              <div className="text-sm text-gray-500">{stock.companyName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Holdings</div>
              <div className="text-md">{stock.shares.toLocaleString()} shares</div>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="shares" className="block text-sm font-medium text-gray-700">
            Shares to Sell
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="shares"
              value={shares}
              onChange={(e) => handleStringNumberInputChange(e.target.value, setShares)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter number of shares"
              step="0.0001"
              min="0.0001"
              max={stock.shares}
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Maximum: {stock.shares.toLocaleString()} shares
          </p>
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Sale Price Per Share
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => handleStringNumberInputChange(e.target.value, setPrice)}
              className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-gray-700">Total Sale Value</div>
            <div className="text-lg font-semibold">
              ${calculateTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Sell Shares'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SellStockModal;
