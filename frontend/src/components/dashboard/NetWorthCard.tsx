"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface NetWorthData {
  date: string;
  amount: number;
}

const mockNetWorthHistory: NetWorthData[] = [
  { date: 'Jan', amount: 45000 },
  { date: 'Feb', amount: 47500 },
  { date: 'Mar', amount: 46800 },
  { date: 'Apr', amount: 49200 },
  { date: 'May', amount: 51000 },
];

export default function NetWorthCard() {
  const currentNetWorth = mockNetWorthHistory[mockNetWorthHistory.length - 1].amount;
  const previousNetWorth = mockNetWorthHistory[mockNetWorthHistory.length - 2].amount;
  const percentageChange = ((currentNetWorth - previousNetWorth) / previousNetWorth) * 100;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 col-span-2">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Net Worth</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${currentNetWorth.toLocaleString()}
          </p>
          <p className={`text-sm mt-1 ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {percentageChange >= 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}% from last month
          </p>
        </div>
      </div>
      
      <div className="h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockNetWorthHistory}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
