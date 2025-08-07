'use client';

import React, { useState } from 'react';
import { IStock } from '@/types/investment';
import { removeStock, updateStock, getStockPrice } from '@/services/investmentService';
import SellStockModal from './SellStockModal';

interface StockListProps {
  stocks: IStock[];
  accountId: string;
  onStockUpdated: () => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, accountId, onStockUpdated }) => {
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [deletingStock, setDeletingStock] = useState<string | null>(null);
  const [stockToSell, setStockToSell] = useState<IStock | null>(null);

  // Helper function to calculate total value of a stock position
  const calculateStockValue = (stock: IStock): number => {
    return stock.shares * stock.currentPrice;
  };

  // Helper function to calculate gain/loss
  const calculateGainLoss = (stock: IStock): number => {
    const costBasis = stock.shares * stock.avgBuyPrice;
    const currentValue = stock.shares * stock.currentPrice;
    return currentValue - costBasis;
  };

  // Helper function to calculate gain/loss percentage
  const calculateGainLossPercentage = (stock: IStock): number => {
    const costBasis = stock.shares * stock.avgBuyPrice;
    const currentValue = stock.shares * stock.currentPrice;
    return ((currentValue - costBasis) / costBasis) * 100;
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-500">
            {stocks.length} {stocks.length === 1 ? 'stock' : 'stocks'} in portfolio
          </span>
        </div>
        <button
          onClick={handleRefreshPrices}
          disabled={refreshingPrices}
          className={`text-sm px-3 py-1 rounded ${
            refreshingPrices
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
        >
          {refreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
        </button>
      </div>

      {stocks.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-md">
          <p className="text-gray-500">No stocks in this portfolio yet.</p>
          <p className="text-gray-500 mt-2">Click "Add Stock" to add your first stock.</p>
        </div>
      ) : (
        <div className="w-full">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Stock
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                  Shares
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                  Avg. Cost
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                  Current Price
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                  Value
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                  Gain/Loss
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStocks.map((stock) => {
                const value = calculateStockValue(stock);
                const gainLoss = calculateGainLoss(stock);
                const gainLossPercentage = calculateGainLossPercentage(stock);
                const isPositive = gainLoss >= 0;
                
                return (
                  <tr key={stock.ticker}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{stock.ticker}</div>
                        <div className="text-sm text-gray-500">{stock.companyName}</div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {stock.shares.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      ${stock.avgBuyPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        ${stock.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated {formatDate(stock.lastUpdated.toString())}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <div className="text-xs text-gray-500">
                        {((value / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}${Math.abs(gainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setStockToSell(stock)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sell
                        </button>
                        <button
                          onClick={() => handleDeleteStock(stock.ticker)}
                          disabled={deletingStock === stock.ticker}
                          className={`text-red-600 hover:text-red-900 ${
                            deletingStock === stock.ticker ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {deletingStock === stock.ticker ? 'Removing...' : 'Remove'}
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
    </div>
  );
};

export default StockList;
