'use client';

import React, { useState } from 'react';
import { InvestmentAccountData, updateInvestmentAccount, deleteInvestmentAccount } from '@/services/investmentService';
import { toast } from 'react-hot-toast';
import { InvestmentAccountType, IStock } from '@/types/investment';
import StockList from './StockList';
import AddStockModal from './AddStockModal';
import TransactionHistory from './TransactionHistory';
import CashManagement from './CashManagement';

interface InvestmentAccountDetailsProps {
  account: InvestmentAccountData;
  onAccountUpdated: () => void;
  onAccountDeleted?: () => void;
}

const InvestmentAccountDetails: React.FC<InvestmentAccountDetailsProps> = ({
  account,
  onAccountUpdated,
  onAccountDeleted,
}) => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'transactions' | 'cash'>('stocks');
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(account.name);
  const [editedInstitution, setEditedInstitution] = useState(account.institution);
  const [editedType, setEditedType] = useState(account.type);

  // Helper function to format account type for display
  const formatAccountType = (type: InvestmentAccountType): string => {
    switch (type) {
      case InvestmentAccountType.BROKERAGE:
        return 'Brokerage';
      case InvestmentAccountType.RETIREMENT_401K:
        return '401(k)';
      case InvestmentAccountType.ROTH_IRA:
        return 'Roth IRA';
      case InvestmentAccountType.TRADITIONAL_IRA:
        return 'Traditional IRA';
      case InvestmentAccountType.EDUCATION_529:
        return '529 Plan';
      case InvestmentAccountType.HSA:
        return 'HSA';
      case InvestmentAccountType.OTHER:
        return 'Other';
      default:
        return type;
    }
  };

  // Calculate total value of the account
  const calculateTotalValue = (): number => {
    const stocksValue = account.stocks?.reduce((total, stock) => {
      // Use totalShares if available, otherwise calculate from lots
      const totalShares = stock.totalShares !== undefined 
        ? stock.totalShares 
        : stock.lots?.reduce((sum, lot) => sum + lot.shares, 0) || 0;
      return total + (totalShares * stock.currentPrice);
    }, 0) || 0;
    
    return stocksValue + (account.cash || 0);
  };

  const handleSaveAccountDetails = async () => {
    try {
      if (!account.id) return;
      
      await updateInvestmentAccount(account.id, {
        name: editedName,
        institution: editedInstitution,
        type: editedType,
      });
      
      setIsEditing(false);
      onAccountUpdated();
    } catch (error) {
      console.error('Error updating account details:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(account.name);
    setEditedInstitution(account.institution);
    setEditedType(account.type);
    setIsEditing(false);
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!account.id) return;
    
    if (window.confirm(`Are you sure you want to delete this investment account? This action cannot be undone.`)) {
      try {
        await deleteInvestmentAccount(account.id);
        toast.success('Investment account deleted successfully');
        if (onAccountDeleted) {
          onAccountDeleted();
        }
      } catch (error) {
        console.error('Error deleting investment account:', error);
        toast.error('Failed to delete investment account');
      }
    }
  };

  const handleStockAdded = () => {
    setIsAddStockModalOpen(false);
    onAccountUpdated();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Account Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                  Institution
                </label>
                <input
                  type="text"
                  id="institution"
                  value={editedInstitution}
                  onChange={(e) => setEditedInstitution(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <select
                  id="type"
                  value={editedType}
                  onChange={(e) => setEditedType(e.target.value as InvestmentAccountType)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {Object.values(InvestmentAccountType).map((type) => (
                    <option key={type} value={type}>
                      {formatAccountType(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveAccountDetails}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{account.name}</h2>
              <p className="text-gray-600">
                {account.institution} • {formatAccountType(account.type)}
              </p>
            </>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold">
            ${calculateTotalValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-600">
            Total Value
          </div>
          {!isEditing && (
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Edit Account
              </button>
              <button
                onClick={handleDeleteAccount}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stocks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stocks
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('cash')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cash'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cash
          </button>
        </nav>
      </div>
      
      {activeTab === 'stocks' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Stock Holdings</h3>
            <button
              onClick={() => setIsAddStockModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Add Stock
            </button>
          </div>
          
          <StockList 
            stocks={account.stocks || []} 
            accountId={account.id || ''} 
            onStockUpdated={onAccountUpdated} 
          />
        </div>
      )}
      
      {activeTab === 'transactions' && (
        <TransactionHistory 
          transactions={account.transactions || []} 
          accountId={account.id || ''} 
        />
      )}
      
      {activeTab === 'cash' && (
        <CashManagement 
          accountId={account.id || ''} 
          currentCash={account.cash || 0}
          onCashUpdated={onAccountUpdated}
        />
      )}
      
      {isAddStockModalOpen && (
        <AddStockModal
          accountId={account.id || ''}
          onClose={() => setIsAddStockModalOpen(false)}
          onStockAdded={handleStockAdded}
        />
      )}
    </div>
  );
};

export default InvestmentAccountDetails;
