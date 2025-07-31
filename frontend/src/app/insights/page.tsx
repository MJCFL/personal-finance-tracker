'use client';

import { useState, useEffect } from 'react';
import {
  getSpendingPatterns,
  getAnomalies,
  getRecommendations,
  getSavingsGoals,
  getCategoryInsights,
  SpendingPattern,
  Anomaly,
  Recommendation,
  SavingsGoal,
  CategoryInsight
} from '@/services/insightsService';

export default function Insights() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsightsData() {
      try {
        setLoading(true);
        
        // Fetch all insights data in parallel
        const [
          patternsData,
          anomaliesData,
          recommendationsData,
          goalsData,
          insightsData
        ] = await Promise.all([
          getSpendingPatterns(),
          getAnomalies(),
          getRecommendations(),
          getSavingsGoals(),
          getCategoryInsights()
        ]);
        
        setSpendingPatterns(patternsData);
        setAnomalies(anomaliesData);
        setRecommendations(recommendationsData);
        setSavingsGoals(goalsData);
        setCategoryInsights(insightsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching insights data:', err);
        setError('Failed to load insights data');
      } finally {
        setLoading(false);
      }
    }

    fetchInsightsData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Insights</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 rounded-md ${
              selectedTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('patterns')}
            className={`px-4 py-2 rounded-md ${
              selectedTab === 'patterns'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Spending Patterns
          </button>
          <button
            onClick={() => setSelectedTab('goals')}
            className={`px-4 py-2 rounded-md ${
              selectedTab === 'goals'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Savings Goals
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-64">
          <p className="text-gray-500">Loading insights data...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      ) : selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recommendations available</p>
              ) : recommendations.map(recommendation => (
                <div
                  key={recommendation.id}
                  className="flex items-start p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    recommendation.priority === 'high' ? 'bg-red-100' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      recommendation.priority === 'high' ? 'text-red-600' :
                      recommendation.priority === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium">{recommendation.title}</h3>
                    <p className="text-gray-600 mt-1">{recommendation.description}</p>
                    <p className="text-green-600 font-medium mt-2">
                      Potential monthly savings: ${recommendation.potentialSavings.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Anomalies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Anomalies</h2>
            <div className="space-y-4">
              {anomalies.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No spending anomalies detected</p>
              ) : anomalies.map(anomaly => (
                <div key={anomaly.id} className="flex items-start p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">{anomaly.description}</h3>
                    <p className="text-gray-600 mt-1">
                      Amount: ${anomaly.amount.toFixed(2)} 
                      (${anomaly.averageAmount.toFixed(2)} average)
                    </p>
                    <p className="text-red-600 font-medium mt-1">
                      {anomaly.percentageIncrease}% increase from average
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Category Insights</h2>
            <div className="space-y-4">
              {categoryInsights.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No category insights available</p>
              ) : categoryInsights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-medium text-lg">{insight.category}</h3>
                  <p className="text-gray-600 mt-1">
                    Average: ${insight.averageSpending.toFixed(2)}/month
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      insight.trend === 'increasing' ? 'bg-red-100 text-red-800' :
                      insight.trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {insight.percentageChange > 0 ? '↑' : insight.percentageChange < 0 ? '↓' : '→'}
                      {Math.abs(insight.percentageChange)}%
                    </span>
                    <span className="text-gray-500 text-sm ml-2">{insight.trend}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Common merchants:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {insight.commonMerchants.map((merchant, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {merchant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'patterns' && (
        <div className="space-y-6">
          {/* Recurring Expenses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recurring Expenses</h2>
            <div className="space-y-4">
              {spendingPatterns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recurring expenses detected</p>
              ) : spendingPatterns.map(pattern => (
                <div key={pattern.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{pattern.description}</h3>
                      <p className="text-gray-600 mt-1">
                        ${pattern.amount.toFixed(2)} ({pattern.frequency})
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {pattern.category}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Last charges:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pattern.lastOccurrences.map((date, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {date}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'goals' && (
        <div className="space-y-6">
          {/* Savings Goals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Savings Goals</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Add Goal
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savingsGoals.length === 0 ? (
                <p className="text-gray-500 text-center py-4 col-span-2">No savings goals available</p>
              ) : savingsGoals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{goal.name}</h3>
                      <span className="text-blue-600 font-medium">
                        ${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-gray-600">
                      <span>Monthly contribution: ${goal.monthlyContribution.toFixed(2)}</span>
                      <span>Target: {goal.projectedCompletion}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
