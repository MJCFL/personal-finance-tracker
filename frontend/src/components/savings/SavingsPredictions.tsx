'use client';

import React, { useState, useEffect } from 'react';
import { Account, SavingsBucket } from '@/types/account';
import { FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SavingsPredictionsProps {
  accounts: Account[];
}

interface PredictionData {
  name: string;
  value: number;
}

interface GoalPrediction {
  bucketId: string;
  bucketName: string;
  accountName: string;
  currentAmount: number;
  goalAmount: number | undefined;
  isEmergencyFund: boolean;
  monthlyContribution: number;
  monthsToGoal: number;
  projectedDate: string;
  chartData: PredictionData[];
}

export default function SavingsPredictions({ accounts }: SavingsPredictionsProps) {
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(100);
  // We'll use memoized values directly instead of state to prevent infinite loops

  // Extract all buckets with goals from all accounts
  const bucketsWithGoals = accounts.flatMap(account => 
    (account.buckets || [])
      .filter(bucket => bucket.goal !== undefined)
      .map(bucket => ({
        ...bucket,
        accountName: account.name,
        accountId: account.id
      }))
  );

  useEffect(() => {
    // Set default selected bucket if available
    if (bucketsWithGoals.length > 0 && !selectedBucketId) {
      setSelectedBucketId(bucketsWithGoals[0].id);
    }
  }, [bucketsWithGoals]); // Remove selectedBucketId from dependencies

  // Use React.useMemo to memoize the predictions calculation
  const { goalPredictionsData, selectedPredictionData } = React.useMemo(() => {
    // Calculate predictions for all buckets with goals
    const predictions = bucketsWithGoals.map(bucket => {
      const currentAmount = bucket.amount;
      const goalAmount = bucket.goal;
      
      if (!goalAmount) return null;
      
      const amountNeeded = goalAmount - currentAmount;
      const monthsToGoal = Math.ceil(amountNeeded / monthlyContribution);
      
      // Calculate projected completion date
      const today = new Date();
      const projectedDate = new Date(today);
      projectedDate.setMonth(today.getMonth() + monthsToGoal);
      
      // Generate chart data
      const chartData: PredictionData[] = [];
      for (let i = 0; i <= monthsToGoal; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() + i);
        
        chartData.push({
          name: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          value: Math.min(currentAmount + (monthlyContribution * i), goalAmount)
        });
      }
      
      return {
        bucketId: bucket.id,
        bucketName: bucket.name,
        accountName: bucket.accountName,
        currentAmount,
        goalAmount,
        isEmergencyFund: bucket.isEmergencyFund,
        monthlyContribution,
        monthsToGoal,
        projectedDate: projectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        chartData
      };
    }).filter(Boolean) as GoalPrediction[];
    
    // Find selected prediction
    const selected = predictions.find(p => p.bucketId === selectedBucketId) || null;
    
    return { goalPredictionsData: predictions, selectedPredictionData: selected };
  }, [bucketsWithGoals, monthlyContribution, selectedBucketId]);

  // Use the memoized values directly instead of updating state
  // This prevents the infinite render loop

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold flex items-center mb-6">
        <FaChartLine className="mr-2" /> Savings Predictions
      </h2>

      {bucketsWithGoals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No savings goals found.</p>
          <p className="mt-2">Add goals to your savings buckets to see predictions.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Savings Goal
                </label>
                <select
                  value={selectedBucketId || ''}
                  onChange={(e) => setSelectedBucketId(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                >
                  {bucketsWithGoals.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.isEmergencyFund ? '🛡️ ' : ''}{bucket.name} ({bucket.accountName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Contribution ($)
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  min="1"
                  step="10"
                />
              </div>

              {selectedPredictionData && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">{selectedPredictionData.bucketName}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Amount:</span>
                      <span className="font-medium">${selectedPredictionData.currentAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Goal Amount:</span>
                      <span className="font-medium">${selectedPredictionData.goalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Contribution:</span>
                      <span className="font-medium">${selectedPredictionData.monthlyContribution.toFixed(2)}</span>
                    </div>
                    <div className="border-t dark:border-gray-600 pt-2 mt-2"></div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Months to Goal:</span>
                      <span className="font-medium">{selectedPredictionData.monthsToGoal}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Projected Date:</span>
                      <span className="font-medium flex items-center">
                        <FaCalendarAlt className="mr-1 text-blue-500" />
                        {selectedPredictionData.projectedDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {selectedPredictionData && (
                <div className="h-80">
                  <h3 className="font-medium mb-3 text-center">Projected Growth</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={selectedPredictionData.chartData.map((item, index) => ({ ...item, key: `chart-data-${index}` }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Projected Amount"
                        stroke="#3b82f6"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">All Goals Projection</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Goal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Months Left</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {goalPredictionsData.map((prediction: GoalPrediction) => (
                    <tr 
                      key={prediction.bucketId}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                        selectedBucketId === prediction.bucketId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => setSelectedBucketId(prediction.bucketId)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {prediction.isEmergencyFund && <span className="mr-1">🛡️</span>}
                          <div>
                            <div className="font-medium">{prediction.bucketName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{prediction.accountName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">${prediction.currentAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">${prediction.goalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{Math.min(100, (prediction.currentAmount / (prediction.goalAmount || 1)) * 100).toFixed(0)}%</span>
                            <span>${prediction.currentAmount.toFixed(2)} / ${prediction.goalAmount?.toFixed(2) || '∞'}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (prediction.currentAmount / (prediction.goalAmount || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{prediction.monthsToGoal}</td>
                      <td className="px-4 py-3">{prediction.projectedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
