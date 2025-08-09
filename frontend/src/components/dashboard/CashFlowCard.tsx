"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getTransactions } from '@/services/transactionService';
import { TransactionType } from '@/types/commonTypes';

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
}

export default function CashFlowCard() {
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCashFlowData() {
      try {
        setLoading(true);
        
        // Get transactions from the last 6 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 5); // Get 6 months including current month
        
        const response = await getTransactions({
          startDate,
          endDate
        });
        
        // Group transactions by month
        const monthlyData: Record<string, { income: number, expenses: number }> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize the last 6 months with zero values
        const today = new Date();
        for (let i = 0; i < 6; i++) {
          const monthIndex = (today.getMonth() - i + 12) % 12; // Handle wrapping around to previous year
          const monthName = months[monthIndex];
          monthlyData[monthName] = { income: 0, expenses: 0 };
        }
        
        // Populate with actual transaction data
        response.transactions.forEach(transaction => {
          const date = new Date(transaction.date);
          const monthName = months[date.getMonth()];
          
          // Only process transactions from the last 6 months
          if (monthlyData[monthName]) {
            if (transaction.type === TransactionType.INCOME) {
              monthlyData[monthName].income += transaction.amount;
            } else if (transaction.type === TransactionType.EXPENSE) {
              monthlyData[monthName].expenses += transaction.amount;
            }
          }
        });
        
        // Convert to array and sort by month chronologically
        const sortedMonths = Object.keys(monthlyData).map(month => {
          return {
            month,
            income: monthlyData[month].income,
            expenses: monthlyData[month].expenses
          };
        });
        
        // Sort months chronologically
        sortedMonths.sort((a, b) => {
          return months.indexOf(a.month) - months.indexOf(b.month);
        });
        
        setCashFlowData(sortedMonths);
        setError(null);
      } catch (err) {
        console.error('Error fetching cash flow data:', err);
        setError('Failed to load cash flow data');
      } finally {
        setLoading(false);
      }
    }

    fetchCashFlowData();
  }, []);
  
  // Calculate current month's cash flow
  const currentMonth = cashFlowData.length > 0 ? 
    cashFlowData[cashFlowData.length - 1] : 
    { month: '', income: 0, expenses: 0 };
  const cashFlow = currentMonth.income - currentMonth.expenses;

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Monthly Cash Flow</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${cashFlow.toLocaleString()}
          </p>
          <div className="flex gap-3 mt-0.5">
            <p className="text-xs text-green-600">
              +${currentMonth.income.toLocaleString()} Income
            </p>
            <p className="text-xs text-red-600">
              -${currentMonth.expenses.toLocaleString()} Expenses
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-40 mt-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading cash flow data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : cashFlowData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No cash flow data available</p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cashFlowData}>
            <XAxis 
              dataKey="month" 
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
              formatter={(value: number) => [`$${value.toLocaleString()}`]}
              contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
            />
            <Legend />
            <Bar dataKey="income" fill="#10B981" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
