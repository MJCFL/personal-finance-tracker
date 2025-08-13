'use client';

import React, { useState } from 'react';
import { ICrypto } from '@/types/investment';
import { formatCurrency } from '@/utils/formatters';
import { updateCryptoPrice, removeCrypto } from '@/services/investmentService';
import { toast } from 'react-hot-toast';
// Import components directly
import AddCryptoModal from './AddCryptoModal';
import CryptoDetail from './CryptoDetail';

interface CryptoListProps {
  cryptos: ICrypto[];
  accountId: string;
  onUpdate: () => void;
}

export default function CryptoList({ cryptos, accountId, onUpdate }: CryptoListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<ICrypto | null>(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [deletingCrypto, setDeletingCrypto] = useState<string | null>(null);

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };
  
  const handleRefreshPrices = async () => {
    if (cryptos.length === 0) {
      toast.error('No cryptocurrencies to refresh');
      return;
    }
    
    setIsRefreshingPrices(true);
    try {
      // Update prices for all cryptos sequentially
      for (const crypto of cryptos) {
        await updateCryptoPrice(accountId, crypto.symbol);
      }
      toast.success('All crypto prices updated successfully');
      onUpdate(); // Refresh the list with new prices
    } catch (error) {
      console.error('Failed to refresh crypto prices:', error);
      toast.error('Failed to refresh some prices');
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  const handleDeleteCrypto = async (symbol: string) => {
    try {
      setDeletingCrypto(symbol);
      await removeCrypto(accountId, symbol);
      toast.success(`${symbol} removed successfully`);
      onUpdate();
    } catch (error) {
      console.error('Error deleting crypto:', error);
      toast.error(`Failed to remove ${symbol}`);
    } finally {
      setDeletingCrypto(null);
    }
  };

  return (
    <div className="mt-4">
      {selectedCrypto ? (
        <div className="mb-6">
          <button
            onClick={() => setSelectedCrypto(null)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Crypto List
          </button>
          
          <CryptoDetail 
            crypto={selectedCrypto} 
            accountId={accountId} 
            onClose={() => setSelectedCrypto(null)} 
            onUpdate={() => {
              onUpdate();
              // Refresh the selected crypto data
              const updatedCrypto = cryptos.find(c => c.symbol === selectedCrypto.symbol);
              if (updatedCrypto) {
                setSelectedCrypto(updatedCrypto);
              }
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-gray-500">
                {cryptos.length} {cryptos.length === 1 ? 'coin' : 'coins'} in portfolio
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleRefreshPrices}
                disabled={isRefreshingPrices}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
              >
                {isRefreshingPrices ? 'Refreshing...' : 'Refresh Prices'}
              </button>
              <button
                onClick={handleAddClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Add Coin
              </button>
            </div>
          </div>
          
          {cryptos.length === 0 ? (
            <div className="bg-gray-50 p-6 text-center rounded-md">
              <p className="text-gray-500">No cryptocurrencies added yet.</p>
              <p className="text-gray-500 mt-2">Click "Add Coin" to add your first cryptocurrency.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">COIN</th>
                    <th className="py-2 px-4 border-b text-right">AMOUNT</th>
                    <th className="py-2 px-4 border-b text-right">AVG. COST</th>
                    <th className="py-2 px-4 border-b text-right">CURRENT PRICE</th>
                    <th className="py-2 px-4 border-b text-right">VALUE</th>
                    <th className="py-2 px-4 border-b text-right">GAIN/LOSS</th>
                    <th className="py-2 px-4 border-b text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptos.map((crypto) => {
                    const totalAmount = crypto.lots.reduce((sum, lot) => sum + lot.amount, 0);
                    const totalCost = crypto.lots.reduce((sum, lot) => sum + (lot.amount * lot.purchasePrice), 0);
                    const avgCost = totalAmount > 0 ? totalCost / totalAmount : 0;
                    const currentValue = totalAmount * crypto.currentPrice;
                    const gainLoss = currentValue - totalCost;
                    const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
                    
                    return (
                      <tr key={crypto.symbol} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">
                          <div className="flex items-center">
                            <div>
                              <div className="text-base font-bold text-gray-900">{crypto.symbol}</div>
                              <div className="text-sm text-gray-600">{crypto.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-right text-base font-bold text-gray-900">{totalAmount.toFixed(6)}</td>
                        <td className="py-2 px-4 border-b text-right text-base font-bold text-gray-900">${avgCost.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b text-right">
                          <div className="text-base font-bold text-gray-900">${crypto.currentPrice.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">{crypto.lastUpdated ? new Date(crypto.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                        </td>
                        <td className="py-2 px-4 border-b text-right">
                          <div className="text-base font-bold text-gray-900">${currentValue.toFixed(2)}</div>
                        </td>
                        <td className="py-2 px-4 border-b text-right">
                          <div className={`text-base font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${Math.abs(gainLoss).toFixed(2)}
                            <div className="text-xs font-medium">{gainLoss >= 0 ? '+' : '-'}{Math.abs(gainLossPercent).toFixed(2)}%</div>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedCrypto(crypto)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCrypto(crypto.symbol);
                              }}
                              disabled={deletingCrypto === crypto.symbol}
                              className={`text-red-600 hover:text-red-800 text-sm ${deletingCrypto === crypto.symbol ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {deletingCrypto === crypto.symbol ? 'Removing...' : 'Remove'}
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
          
          <AddCryptoModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            accountId={accountId}
            onAdd={onUpdate}
          />
        </>
      )}
    </div>
  );
}
