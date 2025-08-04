import React from 'react';
import { AccountType } from '@/types/account';
import { AccountData } from '@/services/accountService';
import { formatCurrency } from '@/utils/formatters';

interface DebtListProps {
  debts: AccountData[];
  selectedDebt: AccountData | null;
  onSelectDebt: (debt: AccountData) => void;
}

const DebtList: React.FC<DebtListProps> = ({ debts, selectedDebt, onSelectDebt }) => {
  // Helper function to determine debt type label
  const getDebtTypeLabel = (type: AccountType): string => {
    switch (type) {
      case AccountType.CREDIT_CARD:
        return 'Credit Card';
      case AccountType.LOAN:
        return 'Loan';
      case AccountType.MORTGAGE:
        return 'Mortgage';
      default:
        return type;
    }
  };

  // Calculate total debt
  const totalDebt = debts.reduce((sum, debt) => sum + Math.abs(debt.balance), 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Debts</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Debt</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(totalDebt)}</p>
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>You don't have any debts tracked yet.</p>
          <p className="mt-2 text-sm">Add credit cards, loans, or mortgages in the Accounts tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {debts.map((debt) => (
            <div
              key={debt.id}
              className={`border rounded-lg p-4 cursor-pointer transition ${
                selectedDebt?.id === debt.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectDebt(debt)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{debt.name}</h3>
                  <p className="text-sm text-gray-500">{getDebtTypeLabel(debt.type)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-500">{formatCurrency(Math.abs(debt.balance))}</p>
                  {debt.interestRate && (
                    <p className="text-xs text-gray-500">{debt.interestRate}% APR</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebtList;
