'use client';

import React, { useState, useEffect } from 'react';
import { IStock, IStockLot } from '@/models/InvestmentAccount';
import { addStock, searchStocks, getStockPrice } from '@/services/investmentService';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../ui/Modal';
import { handleNumberInputChange, handleStringNumberInputChange } from '@/utils/inputHelpers';

interface AddStockModalProps {
  accountId: string;
  onClose: () => void;
  onStockAdded: () => void;
}

interface StockSearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

const AddStockModal: React.FC<AddStockModalProps> = ({
  accountId,
  onClose,
  onStockAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search for stocks when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Search for stocks
  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a stock from search results
  const handleSelectStock = async (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setSearchQuery(''); // Clear search query
    setSearchResults([]); // Clear search results
    
    // Fetch current price
    try {
      setIsFetchingPrice(true);
      const price = await getStockPrice(stock.ticker);
      setCurrentPrice(price.toFixed(2));
    } catch (error) {
      console.error('Error fetching stock price:', error);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Calculate total value
  const calculateTotalValue = (): number => {
    const sharesNum = parseFloat(shares) || 0;
    const priceNum = parseFloat(currentPrice) || 0;
    return sharesNum * priceNum;
  };
  
  // Calculate cost basis
  const calculateCostBasis = (): number => {
    const sharesNum = parseFloat(shares) || 0;
    const priceNum = parseFloat(purchasePrice) || 0;
    return sharesNum * priceNum;
  };
  
  // Calculate potential gain/loss
  const calculateGainLoss = (): number => {
    return calculateTotalValue() - calculateCostBasis();
  };
  
  // Calculate potential gain/loss percentage
  const calculateGainLossPercentage = (): number => {
    const costBasis = calculateCostBasis();
    return costBasis > 0 ? (calculateGainLoss() / costBasis) * 100 : 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate inputs
      if (!selectedStock) {
        throw new Error('Please select a stock');
      }
      
      const sharesNum = parseFloat(shares);
      if (isNaN(sharesNum) || sharesNum <= 0) {
        throw new Error('Please enter a valid number of shares');
      }
      
      const purchasePriceNum = parseFloat(purchasePrice);
      if (isNaN(purchasePriceNum) || purchasePriceNum <= 0) {
        throw new Error('Please enter a valid purchase price');
      }
      
      if (!purchaseDate) {
        throw new Error('Please enter a purchase date');
      }
      
      const currentPriceNum = parseFloat(currentPrice);
      if (isNaN(currentPriceNum) || currentPriceNum <= 0) {
        throw new Error('Please enter a valid current price');
      }
      
      // Create stock lot
      const stockLot: IStockLot = {
        id: uuidv4(),
        ticker: selectedStock.ticker,
        shares: sharesNum,
        purchasePrice: purchasePriceNum,
        purchaseDate: new Date(purchaseDate),
        notes: notes || undefined,
      };
      
      // Create stock object
      const stockData: IStock = {
        ticker: selectedStock.ticker,
        companyName: selectedStock.name,
        lots: [stockLot],
        currentPrice: currentPriceNum,
        lastUpdated: new Date(),
      };
      
      // Add stock to account
      await addStock(accountId, stockData);
      
      onStockAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add stock');
      console.error('Error adding stock:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Add Stock" onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {!selectedStock ? (
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search for a Stock
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter ticker symbol or company name"
              />
              {isSearching && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((stock) => (
                    <li
                      key={stock.ticker}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectStock(stock)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{stock.ticker}</span>
                          <span className="text-gray-500 ml-2">{stock.exchange}</span>
                        </div>
                        <div className="text-sm text-gray-500">{stock.name}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
              <p className="mt-2 text-sm text-gray-500">No stocks found. Try a different search term.</p>
            )}
          </div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold">{selectedStock.ticker}</div>
                  <div className="text-sm text-gray-500">{selectedStock.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStock(null)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="shares" className="block text-sm font-medium text-gray-700">
                Number of Shares
              </label>
              <input
                type="number"
                id="shares"
                value={shares}
                onChange={(e) => handleStringNumberInputChange(e.target.value, setShares)}
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
                value={purchasePrice}
                onChange={(e) => handleStringNumberInputChange(e.target.value, setPurchasePrice)}
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
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={2}
              />
            </div>
            
            <div>
              <label htmlFor="currentPrice" className="block text-sm font-medium text-gray-700">
                Current Price ($)
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  id="currentPrice"
                  value={currentPrice}
                  onChange={(e) => handleStringNumberInputChange(e.target.value, setCurrentPrice)}
                  min="0.01"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
                {isFetchingPrice && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200 space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700">Cost Basis:</div>
                <div className="text-md font-semibold text-gray-900">
                  ${calculateCostBasis().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700">Current Value:</div>
                <div className="text-md font-semibold text-gray-900">
                  ${calculateTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700">Potential Gain/Loss:</div>
                <div className={`text-md font-semibold ${calculateGainLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${calculateGainLoss().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="ml-1 text-sm">({calculateGainLossPercentage().toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          {selectedStock && (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Stock'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AddStockModal;
