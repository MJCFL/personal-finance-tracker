import React from 'react';

interface HealthMetric {
  name: string;
  score: number;
  status: 'good' | 'warning' | 'danger';
  description: string;
}

const mockHealthMetrics: HealthMetric[] = [
  {
    name: 'Savings Rate',
    score: 85,
    status: 'good',
    description: 'You\'re saving 25% of your income'
  },
  {
    name: 'Debt Ratio',
    score: 70,
    status: 'warning',
    description: 'Debt payments are 32% of income'
  },
  {
    name: 'Emergency Fund',
    score: 90,
    status: 'good',
    description: '4.5 months of expenses saved'
  }
];

export default function FinancialHealthCard() {
  const overallScore = Math.round(
    mockHealthMetrics.reduce((sum, metric) => sum + metric.score, 0) / mockHealthMetrics.length
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'danger':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Financial Health Score</h3>
          <p className="text-sm text-gray-500 mt-1">Based on key financial metrics</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">{overallScore}</p>
          <p className="text-sm text-gray-500">out of 100</p>
        </div>
      </div>

      <div className="space-y-4">
        {mockHealthMetrics.map((metric) => (
          <div key={metric.name} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{metric.name}</p>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${getStatusColor(metric.status)}`}>
              <span className="text-sm font-medium">{metric.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
