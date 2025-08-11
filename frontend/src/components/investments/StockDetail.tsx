'use client';

import React, { useState, useEffect } from 'react';
import { IStock, IStockLot } from '@/models/InvestmentAccount';
import { 
  getStockPrice, 
  addStockLot, 
  removeStockLot,
  updateStockLot
} from '@/services/investmentService';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import StockLotsList from './StockLotsList';
import StockPerformanceGraph from './StockPerformanceGraph';
import { FaPlus, FaSync } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

interface StockDetailProps {
  accountId: string;
  stock: IStock;
  onStockUpdated: () => void;
}

const StockDetail: React.FC<StockDetailProps> = ({
  accountId,
  stock,
  onStockUpdated,
}) => {
  const [isAddingLot, setIsAddingLot] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [newLot, setNewLot] = useState<{
    shares: string;
    purchasePrice: string;
    purchaseDate: string;
    notes: string;
  }>({
    shares: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use totalShares from the API if available, otherwise calculate from lots
  const totalShares = stock.totalShares !== undefined 
    ? stock.totalShares 
    : stock.lots.reduce((sum, lot) => sum + lot.shares, 0);
  
  // Calculate average buy price from lots
  const avgBuyPrice = stock.lots.length > 0 
    ? stock.lots.reduce((sum, lot) => sum + (lot.shares * lot.purchasePrice), 0) / totalShares
    : 0;
  
  // Calculate total cost basis
  const totalCostBasis = stock.lots.reduce((sum, lot) => sum + (lot.shares * lot.purchasePrice), 0);
  
  // Calculate total current value
  const totalCurrentValue = totalShares * stock.currentPrice;
  
  // Calculate total gain/loss
  const totalGainLoss = totalCurrentValue - totalCostBasis;
  const totalGainLossPercentage = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  // Handle input change for new lot
  const handleInputChange = (field: string, value: string) => {
    setNewLot((prev) => ({ ...prev, [field]: value }));
  };

  // Handle adding a new lot
  const handleAddLot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Validate inputs
      const sharesNum = parseFloat(newLot.shares);
      if (isNaN(sharesNum) || sharesNum <= 0) {
        throw new Error('Please enter a valid number of shares');
      }
      
      const purchasePriceNum = parseFloat(newLot.purchasePrice);
      if (isNaN(purchasePriceNum) || purchasePriceNum <= 0) {
        throw new Error('Please enter a valid purchase price');
      }
      
      if (!newLot.purchaseDate) {
        throw new Error('Please enter a purchase date');
      }
      
      // Create lot data
      const lotData = {
        shares: sharesNum,
        purchasePrice: purchasePriceNum,
        purchaseDate: new Date(newLot.purchaseDate),
        notes: newLot.notes || undefined,
      };
      
      // Add lot to stock
      await addStockLot(accountId, stock.ticker, lotData);
      
      // Reset form and show success message
      setNewLot({
        shares: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      setIsAddingLot(false);
      setSuccess('Stock lot added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stock data
      onStockUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to add stock lot');
      console.error('Error adding stock lot:', err);
    }
  };

  // Handle updating stock price
  const handleUpdatePrice = async () => {
    try {
      setIsUpdatingPrice(true);
      setError(null);
      
      // Get current price from API
      const price = await getStockPrice(stock.ticker);
      
      // Update stock with new price
      await updateStockLot(accountId, stock.ticker, stock.lots[0].id, {
        purchasePrice: price,
      });
      
      setSuccess('Stock price updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stock data
      onStockUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update stock price');
      console.error('Error updating stock price:', err);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Handle lot update
  const handleLotUpdated = () => {
    onStockUpdated();
    setSuccess('Stock lot updated successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle lot deletion
  const handleLotDeleted = (lotId: string) => {
    const deleteLot = async () => {
      try {
        setError(null);
        
        // Delete lot
        await removeStockLot(accountId, stock.ticker, lotId);
        
        setSuccess('Stock lot deleted successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        
        // Refresh stock data
        onStockUpdated();
      } catch (err: any) {
        setError(err.message || 'Failed to delete stock lot');
        console.error('Error deleting stock lot:', err);
      }
    };
    
    deleteLot();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{stock.ticker}</h2>
          <p className="text-gray-500">{stock.companyName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpdatePrice}
            disabled={isUpdatingPrice}
            className={`flex items-center space-x-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isUpdatingPrice ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaSync className={isUpdatingPrice ? 'animate-spin' : ''} />
            <span>Update Price</span>
          </button>
          <button
            onClick={() => setIsAddingLot(!isAddingLot)}
            className="flex items-center space-x-1 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus />
            <span>Add Lot</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Current Price</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stock.currentPrice)}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Shares</div>
          <div className="text-2xl font-bold text-gray-900">{totalShares.toFixed(4)}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Avg. Buy Price</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(avgBuyPrice)}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCurrentValue)}</div>
        </div>
      </div>

      <div className="mb-8 bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <div className="text-xl font-bold text-gray-800 mb-4">Performance</div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Cost Basis</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalCostBasis)}</div>
          </div>
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Current Value</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalCurrentValue)}</div>
          </div>
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Gain/Loss</div>
            <div className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalGainLoss)} ({formatPercentage(totalGainLossPercentage)})
            </div>
          </div>
        </div>
      </div>

      {isAddingLot && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Lot</h3>
          <form onSubmit={handleAddLot} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shares" className="block text-sm font-medium text-gray-700">
                  Number of Shares
                </label>
                <input
                  type="number"
                  id="shares"
                  value={newLot.shares}
                  onChange={(e) => handleInputChange('shares', e.target.value)}
                  min="0.0001"
                  step="0.0001"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                  Purchase Price ($)
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  value={newLot.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  value={newLot.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  id="notes"
                  value={newLot.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingLot(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Lot
              </button>
            </div>
          </form>
        </div>
      )}

      <StockPerformanceGraph
        ticker={stock.ticker}
        companyName={stock.companyName}
        lots={stock.lots}
        currentPrice={stock.currentPrice}
      />

      <StockLotsList
        accountId={accountId}
        ticker={stock.ticker}
        lots={stock.lots}
        currentPrice={stock.currentPrice}
        onLotUpdated={handleLotUpdated}
        onLotDeleted={handleLotDeleted}
      />
    </div>
  );
};

export default StockDetail;
