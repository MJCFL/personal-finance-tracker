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
  // Sort categories by amount in descending order
  const sortedCategories = [...categories].sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
        <p className="text-sm text-gray-500">Total spent: ${totalSpent.toLocaleString()}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {sortedCategories.map((category) => (
          <div key={category.name} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span className="text-lg">{category.icon}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      ${category.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({category.percentage.toFixed(1)}%)
                    </span>
                    {category.change !== 0 && (
                      <span className={`text-xs ${
                        category.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {category.change > 0 ? '↑' : '↓'} 
                        {Math.abs(category.change)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
