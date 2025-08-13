'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { addCryptoLot } from '@/services/investmentService';

interface AddCryptoLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  cryptoSymbol: string;
  cryptoName: string;
  onAdd: () => void;
}

export default function AddCryptoLotModal({ 
  isOpen, 
  onClose, 
  accountId, 
  cryptoSymbol, 
  cryptoName,
  onAdd 
}: AddCryptoLotModalProps) {
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setAmount('');
    setPurchasePrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !purchasePrice || !purchaseDate) {
      setError('Please fill in all required fields.');
      return;
    }

    const amountValue = parseFloat(amount);
    const priceValue = parseFloat(purchasePrice);

    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (isNaN(priceValue) || priceValue < 0) {
      setError('Please enter a valid purchase price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addCryptoLot(accountId, cryptoSymbol, {
        amount: amountValue,
        purchasePrice: priceValue,
        purchaseDate: new Date(purchaseDate),
        notes: notes || undefined
      });
      
      resetForm();
      onAdd();
      onClose();
    } catch (err) {
      console.error('Failed to add crypto lot:', err);
      setError('Failed to add crypto lot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add ${cryptoName} (${cryptoSymbol}) Lot`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.25"
            step="0.000001"
            min="0.000001"
            required
          />
        </div>
        
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Price ($) *
          </label>
          <input
            type="number"
            id="purchasePrice"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="35000.00"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Date *
          </label>
          <input
            type="date"
            id="purchaseDate"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional notes about this purchase"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white transition ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Lot'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
