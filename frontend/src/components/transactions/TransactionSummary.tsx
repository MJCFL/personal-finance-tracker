import React from 'react';

interface TransactionSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyChange: number;
}

export default function TransactionSummary({
  totalIncome,
  totalExpenses,
  netIncome,
  monthlyChange
}: TransactionSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <p className="text-xl font-semibold text-green-600 mt-1">
              +${totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-100 rounded-full p-2">
            <span className="text-xl">💰</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <p className="text-xl font-semibold text-red-600 mt-1">
              -${totalExpenses.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-100 rounded-full p-2">
            <span className="text-xl">💸</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Net Income</p>
            <p className={`text-xl font-semibold mt-1 ${
              netIncome >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {netIncome >= 0 ? '+' : '-'}${Math.abs(netIncome).toLocaleString()}
            </p>
          </div>
          <div className={`${
            netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'
          } rounded-full p-2`}>
            <span className="text-xl">{netIncome >= 0 ? '📈' : '📉'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Change</p>
            <div className="flex items-center mt-1">
              <p className={`text-xl font-semibold ${
                monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {monthlyChange >= 0 ? '+' : '-'}${Math.abs(monthlyChange).toLocaleString()}
              </p>
              <span className="text-sm text-gray-500 ml-1">
                ({monthlyChange >= 0 ? '+' : '-'}{Math.abs(((monthlyChange / totalExpenses) * 100)).toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className={`${
            monthlyChange >= 0 ? 'bg-green-100' : 'bg-red-100'
          } rounded-full p-2`}>
            <span className="text-xl">{monthlyChange >= 0 ? '⬆️' : '⬇️'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
