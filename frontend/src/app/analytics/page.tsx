'use client';

import React from 'react';
import AssetAllocationChart from '@/components/analytics/AssetAllocationChart';
import PerformanceChart from '@/components/analytics/PerformanceChart';
import FinancialInsights from '@/components/analytics/FinancialInsights';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col p-8">
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-3xl font-bold mb-8 text-gray-100">Analytics Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <AssetAllocationChart />
            <PerformanceChart />
          </div>
          
          <div className="mb-6">
            <FinancialInsights />
          </div>
          
          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Analytics Overview</h2>
            <p className="text-gray-300 mb-4">
              This dashboard provides visual insights into your financial data, helping you make informed decisions about your investments and financial strategy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-100 mb-2">Asset Allocation</h3>
                <p className="text-gray-400 text-sm">
                  Visualize how your portfolio is distributed across different asset types to ensure proper diversification.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-100 mb-2">Performance Tracking</h3>
                <p className="text-gray-400 text-sm">
                  Monitor how your portfolio value changes over time to track your financial progress.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-100 mb-2">Financial Insights</h3>
                <p className="text-gray-400 text-sm">
                  Receive personalized insights and recommendations based on your financial data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
