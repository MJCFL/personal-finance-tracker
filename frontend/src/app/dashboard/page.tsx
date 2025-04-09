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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Financial Snapshot</h1>
        <p className="text-gray-500">Track, analyze, and improve your financial health</p>
      </div>

      {/* Main grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Net Worth Card - Spans 2 columns */}
        <div className="md:col-span-2">
          <NetWorthCard />
        </div>

        {/* Financial Health Score */}
        <div>
          <FinancialHealthCard />
        </div>

        {/* Cash Flow Card */}
        <div>
          <CashFlowCard />
        </div>

        {/* Budget Preview Card */}
        <div>
          <BudgetPreviewCard />
        </div>

        {/* Top Spending Categories */}
        <div>
          <TopSpendingCard />
        </div>

        {/* Recent Transactions - Spans full width */}
        <div className="md:col-span-2 lg:col-span-3">
          <RecentTransactionsCard />
        </div>
      </div>

      {/* Floating Quick Actions Button */}
      <QuickActions />
    </div>
  );
}
