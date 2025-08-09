import React from 'react';
import NetWorthCard from '@/components/dashboard/NetWorthCard';
import CashFlowCard from '@/components/dashboard/CashFlowCard';
import BudgetPreviewCard from '@/components/dashboard/BudgetPreviewCard';
import TopSpendingCard from '@/components/dashboard/TopSpendingCard';
import RecentTransactionsCard from '@/components/dashboard/RecentTransactionsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import FinancialHealthCard from '@/components/dashboard/FinancialHealthCard';

export default function DashboardPage() {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Your Financial Snapshot</h1>
        <p className="text-gray-500 text-sm">Track, analyze, and improve your financial health</p>
      </div>

      {/* Top row - Net Worth and Financial Health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        {/* Net Worth Card - Takes 3/4 of the width on large screens */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow">
          <NetWorthCard />
        </div>

        {/* Financial Health Score - Takes 1/4 of the width on large screens */}
        <div className="bg-white rounded-lg shadow">
          <FinancialHealthCard />
        </div>
      </div>

      {/* Middle row - Cash Flow, Budget, and Top Spending */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Cash Flow Card */}
        <div className="bg-white rounded-lg shadow">
          <CashFlowCard />
        </div>

        {/* Budget Preview Card */}
        <div className="bg-white rounded-lg shadow">
          <BudgetPreviewCard />
        </div>

        {/* Top Spending Categories */}
        <div className="bg-white rounded-lg shadow">
          <TopSpendingCard />
        </div>
      </div>

      {/* Bottom row - Recent Transactions */}
      <div className="bg-white rounded-lg shadow mb-4">
        <RecentTransactionsCard />
      </div>

      {/* Floating Quick Actions Button */}
      <QuickActions />
    </div>
  );
}
