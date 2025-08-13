'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatters';
import Modal from '../ui/Modal';
import { TransactionType } from '@/types/investment';
import { sellCrypto } from '@/services/investmentService';

interface SellCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  cryptoSymbol: string;
  cryptoName: string;
  currentPrice: number;
  totalAmount: number;
  onSell: () => void;
}

export default function SellCryptoModal({
  isOpen,
  onClose,
  accountId,
  cryptoSymbol,
  cryptoName,
  currentPrice,
  totalAmount,
  onSell
}: SellCryptoModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(currentPrice);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    if (amount > totalAmount) {
      setError(`You can't sell more than you own (${totalAmount.toFixed(6)})`);
      return;
    }
    
    if (price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await sellCrypto(accountId, {
        symbol: cryptoSymbol,
        name: cryptoName,
        amount,
        price,
        date: new Date(date),
        notes
      });
      
      toast.success(`Successfully sold ${amount.toFixed(6)} ${cryptoSymbol}`);
      onSell();
      onClose();
    } catch (error) {
      console.error('Error selling crypto:', error);
      setError('Failed to sell crypto. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount(0);
    setPrice(currentPrice);
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const totalValue = amount * price;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Sell ${cryptoName} (${cryptoSymbol})`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount to Sell
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              step="0.000001"
              min="0"
              max={totalAmount}
              className="block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{cryptoSymbol}</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Available: {totalAmount.toFixed(6)} {cryptoSymbol}
          </p>
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Sale Price
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Current market price: ${currentPrice.toFixed(2)}
          </p>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Sale Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
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
            rows={3}
            className="mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Add any notes about this sale"
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Sale Value:</span>
            <span className="text-lg font-semibold">{formatCurrency(totalValue)}</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Sell Crypto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
