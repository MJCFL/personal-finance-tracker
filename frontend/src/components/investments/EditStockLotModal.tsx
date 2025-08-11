'use client';

import React, { useState } from 'react';
import { IStockLot } from '@/models/InvestmentAccount';
import { updateStockLot } from '@/services/investmentService';
import Modal from '../ui/Modal';
import { handleStringNumberInputChange } from '@/utils/inputHelpers';

interface EditStockLotModalProps {
  accountId: string;
  ticker: string;
  lot: IStockLot;
  onClose: () => void;
  onLotUpdated: () => void;
}

const EditStockLotModal: React.FC<EditStockLotModalProps> = ({
  accountId,
  ticker,
  lot,
  onClose,
  onLotUpdated,
}) => {
  const [shares, setShares] = useState(lot.shares.toString());
  const [purchasePrice, setPurchasePrice] = useState(lot.purchasePrice.toString());
  const [purchaseDate, setPurchaseDate] = useState(
    new Date(lot.purchaseDate).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(lot.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate cost basis
  const calculateCostBasis = (): number => {
    const sharesNum = parseFloat(shares) || 0;
    const priceNum = parseFloat(purchasePrice) || 0;
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
      
      const purchasePriceNum = parseFloat(purchasePrice);
      if (isNaN(purchasePriceNum) || purchasePriceNum <= 0) {
        throw new Error('Please enter a valid purchase price');
      }
      
      if (!purchaseDate) {
        throw new Error('Please enter a purchase date');
      }
      
      // Create updated lot object
      const updatedLot = {
        shares: sharesNum,
        purchasePrice: purchasePriceNum,
        purchaseDate,
        notes: notes || undefined,
      };
      
      // Update lot
      await updateStockLot(accountId, ticker, lot.id, updatedLot);
      
      onLotUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update stock lot');
      console.error('Error updating stock lot:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Edit Stock Lot" onClose={onClose} isOpen={true}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
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
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-gray-700">Cost Basis:</div>
            <div className="text-md font-semibold text-gray-900">
              ${calculateCostBasis().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update Lot'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditStockLotModal;
