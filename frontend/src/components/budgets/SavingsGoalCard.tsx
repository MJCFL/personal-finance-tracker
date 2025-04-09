import React from 'react';

interface SavingsGoalProps {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon?: string;
}

export default function SavingsGoalCard({
  name,
  targetAmount,
  currentAmount,
  targetDate,
  icon = '🎯'
}: SavingsGoalProps) {
  const percentage = (currentAmount / targetAmount) * 100;
  const remaining = targetAmount - currentAmount;
  const targetDateObj = new Date(targetDate);
  const daysRemaining = Math.ceil((targetDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusColor = () => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 50) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const calculateMonthlyTarget = () => {
    const monthsRemaining = daysRemaining / 30;
    return remaining / monthsRemaining;
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">
                Target: ${targetAmount.toLocaleString()} by {new Date(targetDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor()}`}>
            {percentage.toFixed(0)}%
          </div>
        </div>

        <div className="mt-4">
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
              <div
                style={{ width: `${Math.min(percentage, 100)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Saved so far</p>
            <p className="font-medium text-gray-900">
              ${currentAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Still needed</p>
            <p className="font-medium text-gray-900">
              ${remaining.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Monthly target</p>
              <p className="font-medium text-blue-600">
                ${calculateMonthlyTarget().toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Time remaining</p>
              <p className="font-medium text-gray-900">
                {daysRemaining} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
