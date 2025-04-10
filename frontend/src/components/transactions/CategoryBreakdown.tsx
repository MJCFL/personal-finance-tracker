'use client';

import React from 'react';

interface Category {
  name: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
  change: number;
}

interface CategoryBreakdownProps {
  categories: Category[];
  totalSpent: number;
}

export default function CategoryBreakdown({ categories, totalSpent }: CategoryBreakdownProps) {
  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-gray-900 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-white text-lg font-medium">Spending Analysis</h2>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {sortedCategories.map((category, index) => (
          <div key={category.name} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: category.color + '20' }}>
                  {category.icon}
                </div>
                <div>
                  <p className="text-white font-medium">{category.name}</p>
                  <p className="text-sm text-gray-400">${category.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white font-medium">{category.percentage.toFixed(1)}%</p>
                <p className={`text-xs ${category.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {category.change >= 0 ? '↑' : '↓'} {Math.abs(category.change).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gray-800 rounded-full" />
              <div
                className="relative h-1.5 rounded-full transition-all duration-500 group-hover:h-2"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color + '80',
                }}
              >
                <div className="absolute right-0 -top-1 w-3 h-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform"
                  style={{ backgroundColor: category.color }}>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Spent</p>
            <p className="text-2xl font-light text-white mt-1">${totalSpent.toLocaleString()}</p>
          </div>
          <button className="px-4 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-xl hover:bg-blue-500/30 transition-colors">
            View Details
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-3">
            <p className="text-gray-400 text-xs">Avg. per Day</p>
            <p className="text-white mt-1">${(totalSpent / 30).toFixed(2)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-3">
            <p className="text-gray-400 text-xs">Most Spent</p>
            <p className="text-white mt-1">{sortedCategories[0]?.name || 'N/A'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-3">
            <p className="text-gray-400 text-xs">Least Spent</p>
            <p className="text-white mt-1">{sortedCategories[sortedCategories.length - 1]?.name || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
