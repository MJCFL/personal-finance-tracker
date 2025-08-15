"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getFinancialSummary } from '@/services/insightsService';

interface NetWorthData {
  date: string;
  amount: number;
}

export default function NetWorthCard() {
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNetWorthData() {
      try {
        setLoading(true);
        
        // Get financial summary which includes net worth (with investments)
        const financialSummary = await getFinancialSummary();
        
        // Use the net worth value that includes investments
        const totalNetWorth = financialSummary.netWorth;
        
        // Create net worth data for the current month only
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        const currentMonth = months[today.getMonth()];
        
        // Create net worth history with just the current month
        const netWorthData: NetWorthData[] = [
          { date: currentMonth, amount: totalNetWorth }
        ];
        
        setNetWorthHistory(netWorthData);
        setError(null);
      } catch (err) {
        console.error('Error fetching net worth data:', err);
        setError('Failed to load net worth data');
      } finally {
        setLoading(false);
      }
    }

    fetchNetWorthData();
  }, []);
  
  // Calculate current net worth
  const currentNetWorth = netWorthHistory.length > 0 ? 
    netWorthHistory[0].amount : 0;
  // Since we're only showing current month, we don't have historical data for percentage change
  const hasRealData = false;
  const percentageChange = 0;

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Net Worth</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${currentNetWorth.toLocaleString()}
          </p>
          {hasRealData ? (
            <p className={`text-xs mt-1 ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentageChange >= 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}% from last month
            </p>
          ) : (
            <p className="text-xs mt-1 text-gray-500">No historical data available</p>
          )}
        </div>
      </div>
      
      <div className="h-40 mt-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-500">Loading net worth data...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        ) : netWorthHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-500">No net worth data available</p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={netWorthHistory}>
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
        )}
      </div>
    </div>
  );
}
