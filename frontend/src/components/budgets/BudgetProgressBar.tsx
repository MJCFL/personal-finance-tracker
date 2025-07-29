'use client';

import React from 'react';

interface BudgetProgressBarProps {
  spent: number;
  total: number;
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ spent, total }) => {
  // Calculate percentage spent
  const percentage = Math.min(Math.round((spent / total) * 100), 100);
  
  // Determine color based on percentage
  let barColor = 'bg-green-500';
  if (percentage >= 90) {
    barColor = 'bg-red-500';
  } else if (percentage >= 75) {
    barColor = 'bg-yellow-500';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span>{percentage}% used</span>
        {percentage > 100 && (
          <span className="text-red-500 font-medium">
            Over budget by {((spent - total) / total * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className={`h-2.5 rounded-full ${barColor}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BudgetProgressBar;
