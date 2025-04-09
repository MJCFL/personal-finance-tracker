import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

const mockSpendingData: SpendingCategory[] = [
  { name: 'Housing', amount: 1800, color: '#3B82F6' },
  { name: 'Food', amount: 850, color: '#10B981' },
  { name: 'Transport', amount: 300, color: '#8B5CF6' },
  { name: 'Shopping', amount: 400, color: '#F59E0B' },
  { name: 'Entertainment', amount: 250, color: '#EC4899' },
];

export default function TopSpendingCard() {
  const total = mockSpendingData.reduce((sum, category) => sum + category.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
      
      <div className="flex items-center">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockSpendingData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
              >
                {mockSpendingData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`]}
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 ml-4">
          <div className="space-y-2">
            {mockSpendingData.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    ${category.amount.toLocaleString()}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({Math.round((category.amount / total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
