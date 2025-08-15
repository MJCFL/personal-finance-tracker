'use client';

import React, { useState } from 'react';
import { ITransaction, TransactionType } from '@/types/investment';
import { deleteTransaction } from '@/services/investmentService';
import { toast } from 'react-hot-toast';

interface TransactionHistoryProps {
  transactions: ITransaction[];
  accountId: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, accountId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to format transaction type
  const formatTransactionType = (type: TransactionType, notes?: string): string => {
    // Special case for removed stocks (using notes field)
    if (type === TransactionType.SELL && notes === 'REMOVED_NOT_SOLD') {
      return 'Removed';
    }
    
    switch (type) {
      case TransactionType.BUY:
        return 'Buy';
      case TransactionType.SELL:
        return 'Sell';
      case TransactionType.REMOVE: // Keep this for type safety, though not used in DB
        return 'Removed';
      case TransactionType.DIVIDEND:
        return 'Dividend';
      case TransactionType.DEPOSIT:
        return 'Cash Deposit';
      case TransactionType.WITHDRAWAL:
        return 'Cash Withdrawal';
      default:
        return type;
    }
  };

  // Helper function to get transaction icon
  const getTransactionIcon = (type: TransactionType, notes?: string): string => {
    // Special case for removed stocks
    if (type === TransactionType.SELL && notes === 'REMOVED_NOT_SOLD') {
      return '❌'; // X mark for removals
    }
    
    switch (type) {
      case TransactionType.BUY:
        return '↓';
      case TransactionType.SELL:
        return '↑';
      case TransactionType.REMOVE: // Keep for type safety
        return '❌';
      case TransactionType.DIVIDEND:
        return '💰';
      case TransactionType.DEPOSIT:
        return '⬇️';
      case TransactionType.WITHDRAWAL:
        return '⬆️';
      default:
        return '•';
    }
  };

  // Helper function to get transaction color
  const getTransactionColor = (type: TransactionType, notes?: string): string => {
    // Special case for removed stocks
    if (type === TransactionType.SELL && notes === 'REMOVED_NOT_SOLD') {
      return 'text-orange-600'; // Orange for removals
    }
    
    switch (type) {
      case TransactionType.BUY:
        return 'text-blue-600';
      case TransactionType.SELL:
        return 'text-green-600';
      case TransactionType.REMOVE: // Keep for type safety
        return 'text-orange-600';
      case TransactionType.DIVIDEND:
        return 'text-green-600';
      case TransactionType.DEPOSIT:
        return 'text-blue-600';
      case TransactionType.WITHDRAWAL:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Handle transaction deletion
  const handleDeleteTransaction = async (transactionId: string | undefined) => {
    if (!transactionId || !accountId) return;
    
    try {
      setIsDeleting(true);
      setSelectedTransactionId(transactionId);
      
      await deleteTransaction(accountId, transactionId);
      toast.success('Transaction deleted successfully');
      
      // The account data will be refreshed via the event emitter
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction');
      console.error('Error deleting transaction:', error);
    } finally {
      setIsDeleting(false);
      setSelectedTransactionId(null);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
      
      {transactions.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded-md">
          <p className="text-gray-500">No transactions yet.</p>
          <p className="text-gray-500 mt-2">Transactions will appear here when you buy or sell stocks, or deposit/withdraw cash.</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Amount</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                    {formatDate(transaction.date.toString())}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <span className={`mr-2 ${getTransactionColor(transaction.type, transaction.notes)}`}>
                        {getTransactionIcon(transaction.type, transaction.notes)}
                      </span>
                      <span className={`font-medium ${getTransactionColor(transaction.type, transaction.notes)}`}>{formatTransactionType(transaction.type, transaction.notes)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {transaction.ticker ? (
                      <div>
                        <span className="font-medium">{transaction.ticker}</span>
                        {transaction.shares && (
                          <span className="ml-1">
                            ({transaction.shares} {transaction.shares === 1 ? 'share' : 'shares'})
                          </span>
                        )}
                        {transaction.price && (
                          <span className="ml-1">@ ${transaction.price.toFixed(2)}</span>
                        )}
                      </div>
                    ) : (
                      <span>Cash {transaction.type === TransactionType.DEPOSIT ? 'deposit' : 'withdrawal'}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                    <span className={`font-medium ${
                      transaction.type === TransactionType.BUY || transaction.type === TransactionType.WITHDRAWAL
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {transaction.type === TransactionType.BUY || transaction.type === TransactionType.WITHDRAWAL ? '-' : '+'}
                      ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-right">
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      disabled={isDeleting && selectedTransactionId === transaction.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Delete transaction without affecting balance"
                    >
                      {isDeleting && selectedTransactionId === transaction.id ? 'Deleting...' : '🗑️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
