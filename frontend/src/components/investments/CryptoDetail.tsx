'use client';

import React, { useState } from 'react';
import { ICrypto, ICryptoLot } from '@/types/investment';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CryptoLotsTable from './CryptoLotsTable';
import CryptoPerformanceGraph from './CryptoPerformanceGraph';
import AddCryptoLotModal from './AddCryptoLotModal';
import SellCryptoModal from './SellCryptoModal';
import RemoveCryptoModal from './RemoveCryptoModal';
import { updateCryptoPrice } from '@/services/investmentService';
import { toast } from 'react-hot-toast';

interface CryptoDetailProps {
  crypto: ICrypto;
  accountId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CryptoDetail({ crypto, accountId, onClose, onUpdate }: CryptoDetailProps) {
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [priceUpdateError, setPriceUpdateError] = useState<string | null>(null);

  const totalAmount = crypto.lots.reduce((sum, lot) => sum + lot.amount, 0);
  const totalValue = totalAmount * crypto.currentPrice;
  
  const totalCost = crypto.lots.reduce((sum, lot) => sum + (lot.amount * lot.purchasePrice), 0);
  const totalGainLoss = totalValue - totalCost;
  const percentChange = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  const handleUpdatePrice = async () => {
    setIsUpdatingPrice(true);
    setPriceUpdateError(null);
    
    try {
      console.log(`Updating price for ${crypto.symbol}...`);
      const updatedAccount = await updateCryptoPrice(accountId, crypto.symbol);
      
      // Log the updated price for debugging
      const updatedCrypto = updatedAccount?.cryptos?.find((c: any) => c.symbol === crypto.symbol);
      if (updatedCrypto) {
        console.log(`Updated price for ${crypto.symbol}: ${updatedCrypto.currentPrice}`);
      }
      
      toast.success(`${crypto.name} price updated successfully`);
      
      // Force a refresh of the parent component to show the updated price
      onUpdate();
    } catch (error) {
      console.error('Failed to update crypto price:', error);
      setPriceUpdateError('Failed to update price. Please try again.');
      toast.error('Failed to update price');
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold">{crypto.name} ({crypto.symbol})</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsAddLotModalOpen(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add Lot
          </button>
          <button
            onClick={() => setIsSellModalOpen(true)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={totalAmount <= 0}
          >
            Sell
          </button>
          <button
            onClick={handleUpdatePrice}
            disabled={isUpdatingPrice}
            className={`px-3 py-1 rounded transition ${
              isUpdatingPrice 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isUpdatingPrice ? 'Updating...' : 'Update Price'}
          </button>
          <button
            onClick={() => setIsRemoveModalOpen(true)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Remove
          </button>
        </div>
      </div>

      {priceUpdateError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {priceUpdateError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Current Price</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(crypto.currentPrice)}</div>
          <div className="text-xs text-gray-400 mt-1">
            Last updated: {formatDate(crypto.lastUpdated)}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Amount</div>
          <div className="text-2xl font-bold text-gray-900">{totalAmount.toFixed(6)}</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Avg. Cost</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalAmount > 0 ? totalCost / totalAmount : 0)}
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
        </div>
      </div>

      <div className="mb-8 bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <div className="text-xl font-bold text-gray-800 mb-4">Performance</div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Cost Basis</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalCost)}</div>
          </div>
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Current Value</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
          </div>
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Gain/Loss</div>
            <div className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalGainLoss)} ({percentChange.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
        <div className="bg-white p-4 rounded-lg shadow h-64">
          <CryptoPerformanceGraph crypto={crypto} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Lots</h3>
        <CryptoLotsTable 
          lots={crypto.lots} 
          currentPrice={crypto.currentPrice} 
          accountId={accountId}
          cryptoSymbol={crypto.symbol}
          onUpdate={onUpdate}
        />
      </div>

      <AddCryptoLotModal
        isOpen={isAddLotModalOpen}
        onClose={() => setIsAddLotModalOpen(false)}
        accountId={accountId}
        cryptoSymbol={crypto.symbol}
        cryptoName={crypto.name}
        onAdd={onUpdate}
      />
      
      <SellCryptoModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        accountId={accountId}
        cryptoSymbol={crypto.symbol}
        cryptoName={crypto.name}
        currentPrice={crypto.currentPrice}
        totalAmount={totalAmount}
        onSell={onUpdate}
      />
      
      <RemoveCryptoModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        accountId={accountId}
        cryptoSymbol={crypto.symbol}
        cryptoName={crypto.name}
        onRemove={() => {
          onUpdate();
          onClose(); // Close the detail view since the crypto is removed
          toast.success(`${crypto.name} (${crypto.symbol}) removed from portfolio`);
        }}
      />
    </div>
  );
}
