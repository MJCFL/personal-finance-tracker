'use client';

import React, { useState, useEffect } from 'react';
import { IStockLot } from '@/models/InvestmentAccount';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EditStockLotModal from './EditStockLotModal';

interface StockLotsListProps {
  accountId: string;
  ticker: string;
  lots: IStockLot[];
  currentPrice: number;
  onLotUpdated: () => void;
  onLotDeleted: (lotId: string) => void;
}

const StockLotsList: React.FC<StockLotsListProps> = ({
  accountId,
  ticker,
  lots,
  currentPrice,
  onLotUpdated,
  onLotDeleted,
}) => {
  const [editingLot, setEditingLot] = useState<IStockLot | null>(null);
  const [sortField, setSortField] = useState<keyof IStockLot>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort lots based on current sort field and direction
  const sortedLots = [...lots].sort((a, b) => {
    if (sortField === 'purchaseDate') {
      const dateA = new Date(a.purchaseDate).getTime();
      const dateB = new Date(b.purchaseDate).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'shares' || sortField === 'purchasePrice') {
      const valueA = Number(a[sortField]);
      const valueB = Number(b[sortField]);
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
    return 0;
  });

  // Calculate performance metrics for a lot
  const calculatePerformance = (lot: IStockLot) => {
    const costBasis = lot.shares * lot.purchasePrice;
    const currentValue = lot.shares * currentPrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercentage = (gainLoss / costBasis) * 100;
    
    return {
      costBasis,
      currentValue,
      gainLoss,
      gainLossPercentage,
    };
  };

  // Handle sort column click
  const handleSort = (field: keyof IStockLot) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Stock Lots</h3>
      
      {lots.length === 0 ? (
        <p className="text-gray-500">No lots found for this stock.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('purchaseDate')}
                >
                  Date
                  {sortField === 'purchaseDate' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  scope="col" 
                  className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('shares')}
                >
                  Shares
                  {sortField === 'shares' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  scope="col" 
                  className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('purchasePrice')}
                >
                  Price
                  {sortField === 'purchasePrice' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Basis
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gain/Loss
                </th>
                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLots.map((lot) => {
                const performance = calculatePerformance(lot);
                return (
                  <tr key={lot.id}>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(lot.purchaseDate)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {lot.shares.toFixed(4)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(lot.purchasePrice)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(performance.costBasis)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(performance.currentValue)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-right">
                      <div className={`text-sm ${performance.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(performance.gainLoss)}
                      </div>
                      <div className={`text-xs ${performance.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(performance.gainLossPercentage)}
                      </div>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900 max-w-[120px] truncate">
                      {lot.notes || '-'}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setEditingLot(lot)}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this lot?')) {
                              onLotDeleted(lot.id);
                            }
                          }}
                          className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                        >
                          Delete
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

      {editingLot && (
        <EditStockLotModal
          accountId={accountId}
          ticker={ticker}
          lot={editingLot}
          onClose={() => setEditingLot(null)}
          onLotUpdated={onLotUpdated}
        />
      )}
    </div>
  );
};

export default StockLotsList;
