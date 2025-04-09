import React from 'react';

interface BudgetCardProps {
  category: string;
  spent: number;
  budget: number;
  color: string;
  icon?: string;
  rollover?: number;
}

export default function BudgetCard({ 
  category, 
  spent, 
  budget, 
  color,
  icon = '💰',
  rollover = 0
}: BudgetCardProps) {
  const totalBudget = budget + rollover;
  const percentage = (spent / totalBudget) * 100;
  const remaining = totalBudget - spent;
  const isOverBudget = spent > totalBudget;

  const getStatusColor = () => {
    if (percentage >= 90) return 'bg-red-100 text-red-800';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
              <p className={`text-sm mt-1 ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                ${spent.toLocaleString()} of ${totalBudget.toLocaleString()}
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
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: color
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Remaining</p>
            <p className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(remaining).toLocaleString()}
              {isOverBudget ? ' over' : ' left'}
            </p>
          </div>
          {rollover > 0 && (
            <div>
              <p className="text-gray-500">Rollover</p>
              <p className="font-medium text-blue-600">+${rollover.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
