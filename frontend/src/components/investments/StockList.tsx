'use client';

import React, { useState } from 'react';
import { IStock } from '@/models/InvestmentAccount';
import { removeStock, updateStock, getStockPrice } from '@/services/investmentService';
import SellStockModal from './SellStockModal';
import StockDetail from './StockDetail';
import AddStockModal from './AddStockModal';

interface StockListProps {
  stocks: IStock[];
  accountId: string;
  onStockUpdated: () => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, accountId, onStockUpdated }) => {
  const [selectedStock, setSelectedStock] = useState<IStock | null>(null);
  const [stockToSell, setStockToSell] = useState<IStock | null>(null);
  const [deletingStock, setDeletingStock] = useState<string | null>(null);
  const [refreshingPrices, setRefreshingPrices] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'value' | 'gainLoss'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState<boolean>(false);

  // Helper function to calculate total value of a stock position
  const calculateStockValue = (stock: IStock): number => {
    // Use totalShares from the API if available, otherwise calculate from lots
    const totalShares = stock.totalShares !== undefined 
      ? stock.totalShares 
      : stock.lots.reduce((sum, lot) => sum + lot.shares, 0);
    return totalShares * stock.currentPrice;
  };

  // Helper function to calculate gain/loss
  const calculateGainLoss = (stock: IStock): number => {
    // Calculate total cost basis from lots
    const totalCostBasis = stock.lots.reduce((sum, lot) => sum + (lot.shares * lot.purchasePrice), 0);
    // Use totalShares from the API if available, otherwise calculate from lots
    const totalShares = stock.totalShares !== undefined 
      ? stock.totalShares 
      : stock.lots.reduce((sum, lot) => sum + lot.shares, 0);
    const currentValue = totalShares * stock.currentPrice;
    return currentValue - totalCostBasis;
  };

  // Helper function to calculate gain/loss percentage
  const calculateGainLossPercentage = (stock: IStock): number => {
    // Calculate total cost basis from lots
    const totalCostBasis = stock.lots.reduce((sum, lot) => sum + (lot.shares * lot.purchasePrice), 0);
    // Use totalShares from the API if available, otherwise calculate from lots
    const totalShares = stock.totalShares !== undefined 
      ? stock.totalShares 
      : stock.lots.reduce((sum, lot) => sum + lot.shares, 0);
    const currentValue = totalShares * stock.currentPrice;
    return totalCostBasis > 0 ? ((currentValue - totalCostBasis) / totalCostBasis) * 100 : 0;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle refreshing stock prices
  const handleRefreshPrices = async () => {
    try {
      setRefreshingPrices(true);
      
      // Update each stock price one by one
      for (const stock of stocks) {
        try {
          const price = await getStockPrice(stock.ticker);
          await updateStock(accountId, stock.ticker, {
            currentPrice: price,
            lastUpdated: new Date(),
          });
        } catch (error) {
          console.error(`Error updating price for ${stock.ticker}:`, error);
        }
      }
      
      onStockUpdated();
    } catch (error) {
      console.error('Error refreshing stock prices:', error);
    } finally {
      setRefreshingPrices(false);
    }
  };

  // Handle deleting a stock
  const handleDeleteStock = async (ticker: string) => {
    try {
      setDeletingStock(ticker);
      await removeStock(accountId, ticker);
      onStockUpdated();
    } catch (error) {
      console.error('Error deleting stock:', error);
    } finally {
      setDeletingStock(null);
    }
  };

  // Sort stocks by value (highest to lowest)
  const sortedStocks = [...stocks].sort((a, b) => {
    const valueA = calculateStockValue(a);
    const valueB = calculateStockValue(b);
    return valueB - valueA;
  });

  // Calculate total portfolio value
  const totalPortfolioValue = stocks.reduce((total, stock) => {
    return total + calculateStockValue(stock);
  }, 0);

  return (
    <div>
      {stockToSell && (
        <SellStockModal
          accountId={accountId}
          stock={stockToSell}
          onClose={() => setStockToSell(null)}
          onStockSold={() => {
            setStockToSell(null);
            onStockUpdated();
          }}
        />
      )}
      
      {isAddStockModalOpen && (
        <AddStockModal
          accountId={accountId}
          onClose={() => setIsAddStockModalOpen(false)}
          onStockAdded={() => {
            setIsAddStockModalOpen(false);
            onStockUpdated();
          }}
        />
      )}
      
      {selectedStock ? (
        <div className="mb-6">
          <button
            onClick={() => setSelectedStock(null)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Stock List
          </button>
          
          <StockDetail
            accountId={accountId}
            stock={selectedStock}
            onStockUpdated={() => {
              onStockUpdated();
              // Refresh the selected stock data
              const updatedStock = stocks.find(s => s.ticker === selectedStock.ticker);
              if (updatedStock) {
                setSelectedStock(updatedStock);
              }
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-gray-500">
                {stocks.length} {stocks.length === 1 ? 'stock' : 'stocks'} in portfolio
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleRefreshPrices}
                disabled={refreshingPrices}
                className={`text-sm px-4 py-2 rounded-md ${
                  refreshingPrices
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {refreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
              </button>
              <button
                onClick={() => setIsAddStockModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Add Stock
              </button>
            </div>
          </div>

          {stocks.length === 0 ? (
            <div className="bg-gray-50 p-6 text-center rounded-md">
              <p className="text-gray-500">No stocks in this portfolio yet.</p>
              <p className="text-gray-500 mt-2">Click "Add Stock" to add your first stock.</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">
                      STOCK
                    </th>
                    <th className="py-2 px-4 border-b text-right">
                      SHARES
                    </th>
                    <th className="py-2 px-4 border-b text-right">
                      AVG. COST
                    </th>
                    <th className="py-2 px-4 border-b text-right">
                      CURRENT PRICE
                    </th>
                    <th className="py-2 px-4 border-b text-right">
                      VALUE
                    </th>
                    <th className="py-2 px-4 border-b text-right">
                      GAIN/LOSS
                    </th>
                    <th className="py-2 px-4 border-b text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.map((stock) => {
                    const value = calculateStockValue(stock);
                    const gainLoss = calculateGainLoss(stock);
                    const gainLossPercentage = calculateGainLossPercentage(stock);
                    const isPositive = gainLoss >= 0;
                    
                    return (
                      <tr key={stock.ticker} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">
                          <div className="flex items-center">
                            <div>
                              <div 
                                className="text-base font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
                                onClick={() => setSelectedStock(stock)}
                              >
                                {stock.ticker}
                              </div>
                              <div className="text-sm text-gray-600">{stock.companyName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-right text-base font-bold text-gray-900">
                          {(() => {
                            // Use totalShares from the API if available, otherwise calculate from lots
                            const totalShares = stock.totalShares !== undefined 
                              ? stock.totalShares 
                              : stock.lots.reduce((sum, lot) => sum + lot.shares, 0);
                            return totalShares.toLocaleString('en-US', { maximumFractionDigits: 4 });
                          })()}
                        </td>
                        <td className="py-2 px-4 border-b text-right text-base font-bold text-gray-900">
                          ${(stock.lots.length > 0 ? stock.lots.reduce((sum, lot) => sum + (lot.shares * lot.purchasePrice), 0) / stock.lots.reduce((sum, lot) => sum + lot.shares, 0) : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 border-b text-right">
                          <div className="text-base font-bold text-gray-900">
                            ${stock.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatDate(stock.lastUpdated.toString())}
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-right">
                          <div className="text-base font-bold text-gray-900">
                            ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-600">
                            {((value / totalPortfolioValue) * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-right">
                          <div className={`text-base font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.abs(gainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : '-'}{Math.abs(gainLossPercentage).toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedStock(stock)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => setStockToSell(stock)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Sell
                            </button>
                            <button
                              onClick={() => handleDeleteStock(stock.ticker)}
                              disabled={deletingStock === stock.ticker}
                              className={`text-red-600 hover:text-red-800 text-sm ${
                                deletingStock === stock.ticker ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {deletingStock === stock.ticker ? '...' : 'Remove'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockList;
