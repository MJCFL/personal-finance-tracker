'use client';

import React, { useState } from 'react';
import { ICryptoLot } from '@/types/investment';
import { formatCurrency, formatDate } from '@/utils/formatters';
import EditCryptoLotModal from './EditCryptoLotModal';
import { deleteCryptoLot } from '@/services/investmentService';

interface CryptoLotsTableProps {
  lots: ICryptoLot[];
  currentPrice: number;
  accountId: string;
  cryptoSymbol: string;
  onUpdate: () => void;
}

export default function CryptoLotsTable({ 
  lots, 
  currentPrice, 
  accountId, 
  cryptoSymbol, 
  onUpdate 
}: CryptoLotsTableProps) {
  const [selectedLot, setSelectedLot] = useState<ICryptoLot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEditClick = (lot: ICryptoLot, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLot(lot);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (lot: ICryptoLot, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete this lot of ${lot.amount} ${cryptoSymbol}?`)) {
      setIsDeleting(true);
      setDeleteError(null);
      
      try {
        await deleteCryptoLot(accountId, cryptoSymbol, lot.id);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete crypto lot:', error);
        setDeleteError('Failed to delete lot. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const calculateGainLoss = (lot: ICryptoLot) => {
    const costBasis = lot.amount * lot.purchasePrice;
    const currentValue = lot.amount * currentPrice;
    return currentValue - costBasis;
  };

  const calculatePercentChange = (lot: ICryptoLot) => {
    const costBasis = lot.amount * lot.purchasePrice;
    if (costBasis === 0) return 0;
    
    const currentValue = lot.amount * currentPrice;
    return ((currentValue - costBasis) / costBasis) * 100;
  };

  return (
    <div>
      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {deleteError}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Basis</th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
              <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lots.map((lot) => {
              const gainLoss = calculateGainLoss(lot);
              const percentChange = calculatePercentChange(lot);
              const costBasis = lot.amount * lot.purchasePrice;
              const currentValue = lot.amount * currentPrice;
              
              return (
                <tr key={lot.id}>
                  <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(lot.purchaseDate)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {lot.amount.toFixed(6)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(lot.purchasePrice)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(costBasis)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(currentValue)}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-right">
                    <div className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(gainLoss)}
                    </div>
                    <div className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {percentChange.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={(e) => handleEditClick(lot, e)}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                        disabled={isDeleting}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(lot, e)}
                        className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {selectedLot && (
        <EditCryptoLotModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          accountId={accountId}
          cryptoSymbol={cryptoSymbol}
          lot={selectedLot}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
