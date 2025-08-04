import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InvestmentPortfolio from '@/components/investments/InvestmentPortfolio';

export default function InvestmentsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Stock Portfolio</h1>
        <InvestmentPortfolio />
      </div>
    </ProtectedRoute>
  );
}
