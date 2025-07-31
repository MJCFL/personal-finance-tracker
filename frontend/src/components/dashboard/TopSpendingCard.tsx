"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getTransactions, TransactionData } from '@/services/transactionService';
import { BudgetCategory } from '@/types/budget';
import { TransactionType } from '@/types/commonTypes';

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

// Define category colors for consistent visualization
const categoryColors: Record<string, string> = {
  Housing: '#3B82F6',
  Food: '#10B981',
  Transport: '#8B5CF6',
  Shopping: '#F59E0B',
  Entertainment: '#EC4899',
  Utilities: '#6366F1',
  Healthcare: '#EF4444',
  Education: '#F97316',
  Travel: '#14B8A6',
  Debt: '#8B5CF6',
  Savings: '#22C55E',
  Investments: '#0EA5E9',
  Other: '#64748B'
};

export default function TopSpendingCard() {
  const [spendingData, setSpendingData] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpendingData() {
      try {
        setLoading(true);
        
        // Get transactions from the last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const response = await getTransactions({
          startDate,
          endDate,
          type: TransactionType.EXPENSE
        });
        
        // Group transactions by category
        const categoryTotals: Record<string, number> = {};
        
        response.transactions.forEach(transaction => {
          if (transaction.type === TransactionType.EXPENSE) {
            const category = transaction.category || 'Other';
            categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
          }
        });
        
        // Convert to array and sort by amount (descending)
        const sortedCategories = Object.entries(categoryTotals)
          .map(([name, amount]) => ({
            name,
            amount,
            color: categoryColors[name] || '#64748B' // Default to slate color if not found
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5); // Take top 5 categories
        
        setSpendingData(sortedCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching spending data:', err);
        setError('Failed to load spending data');
      } finally {
        setLoading(false);
      }
    }

    fetchSpendingData();
  }, []);
  
  const total = spendingData.reduce((sum, category) => sum + category.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
      
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">Loading spending data...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">{error}</p>
        </div>
      ) : spendingData.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">No spending data available</p>
        </div>
      ) : (
      <div className="flex items-center">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendingData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
              >
                {spendingData.map((entry, index) => (
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
            {spendingData.map((category, index) => (
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
      )}
    </div>
  );
}
