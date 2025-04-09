import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CashFlowData {
  month: string;
  income: number;
  expenses: number;
}

const mockCashFlowData: CashFlowData[] = [
  { month: 'Jan', income: 6500, expenses: 4200 },
  { month: 'Feb', income: 6500, expenses: 4500 },
  { month: 'Mar', income: 7200, expenses: 4100 },
  { month: 'Apr', income: 7200, expenses: 4800 },
  { month: 'May', income: 7200, expenses: 4300 },
];

export default function CashFlowCard() {
  const currentMonth = mockCashFlowData[mockCashFlowData.length - 1];
  const cashFlow = currentMonth.income - currentMonth.expenses;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Cash Flow</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${cashFlow.toLocaleString()}
          </p>
          <div className="flex gap-4 mt-1">
            <p className="text-sm text-green-600">
              +${currentMonth.income.toLocaleString()} Income
            </p>
            <p className="text-sm text-red-600">
              -${currentMonth.expenses.toLocaleString()} Expenses
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-48 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockCashFlowData}>
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
      </div>
    </div>
  );
}
