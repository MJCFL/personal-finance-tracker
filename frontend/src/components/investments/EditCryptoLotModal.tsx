'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { ICryptoLot } from '@/types/investment';
import { updateCryptoLot } from '@/services/investmentService';

interface EditCryptoLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  cryptoSymbol: string;
  lot: ICryptoLot;
  onUpdate: () => void;
}

export default function EditCryptoLotModal({ 
  isOpen, 
  onClose, 
  accountId, 
  cryptoSymbol, 
  lot,
  onUpdate 
}: EditCryptoLotModalProps) {
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lot) {
      setAmount(lot.amount.toString());
      setPurchasePrice(lot.purchasePrice.toString());
      setPurchaseDate(new Date(lot.purchaseDate).toISOString().split('T')[0]);
      setNotes(lot.notes || '');
    }
  }, [lot]);

  const handleClose = () => {
    setError(null);
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
      await updateCryptoLot(accountId, cryptoSymbol, lot.id, {
        amount: amountValue,
        purchasePrice: priceValue,
        purchaseDate: new Date(purchaseDate),
        notes: notes || undefined
      });
      
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Failed to update crypto lot:', err);
      setError('Failed to update crypto lot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit ${cryptoSymbol} Lot`}>
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
