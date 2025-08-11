'use client';

import React from 'react';
import { InvestmentAccountData } from '@/services/investmentService';
import { InvestmentAccountType } from '@/types/investment';

interface InvestmentAccountListProps {
  accounts: InvestmentAccountData[];
  selectedAccountId?: string;
  onSelectAccount: (account: InvestmentAccountData) => void;
}

const InvestmentAccountList: React.FC<InvestmentAccountListProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
}) => {
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

  // Calculate total value for each account
  const calculateTotalValue = (account: InvestmentAccountData): number => {
    const stocksValue = account.stocks?.reduce((total, stock) => {
      // Use totalShares if available, otherwise calculate from lots
      const shares = stock.totalShares || 
        stock.lots?.reduce((sum, lot) => sum + lot.shares, 0) || 0;
      return total + (shares * stock.currentPrice);
    }, 0) || 0;
    
    return stocksValue + (account.cash || 0);
  };

  // No delete handler needed anymore

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {accounts.map((account) => {
          const totalValue = calculateTotalValue(account);
          const isSelected = account.id === selectedAccountId;
          
          return (
            <li 
              key={account.id} 
              className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
              onClick={() => onSelectAccount(account)}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {account.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {account.institution} • {formatAccountType(account.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-semibold text-gray-900">
                      ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {account.stocks?.length || 0} stocks
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default InvestmentAccountList;
