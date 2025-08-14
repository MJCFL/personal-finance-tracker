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

interface TotalSavingsPrediction {
  currentTotal: number;
  monthlyContribution: number;
  monthlyInterest: number;
  annualInterest: number;
  interestRate: number;
  chartData: PredictionData[];
}

export default function SavingsPredictions({ accounts }: SavingsPredictionsProps) {
  const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'buckets' | 'total'>('buckets');
  // We'll use memoized values directly instead of state to prevent infinite loops

  // Handler for monthly contribution input changes
  const handleMonthlyContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    setMonthlyContribution(value);
  };

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
  const { goalPredictionsData, selectedPredictionData, totalSavingsPrediction } = React.useMemo(() => {
    // Calculate predictions for all buckets with goals
    const predictions = bucketsWithGoals.map(bucket => {
      const currentAmount = bucket.amount;
      const goalAmount = bucket.goal;
      
      if (!goalAmount) return null;
      
      const amountNeeded = goalAmount - currentAmount;
      // Prevent division by zero
      const monthsToGoal = monthlyContribution > 0 ? Math.ceil(amountNeeded / monthlyContribution) : Infinity;
      
      // Calculate projected completion date
      const today = new Date();
      const projectedDate = new Date(today);
      if (monthlyContribution > 0) {
        projectedDate.setMonth(today.getMonth() + monthsToGoal);
      }
      
      // Generate chart data
      const chartData: PredictionData[] = [];
      const maxMonths = monthlyContribution > 0 ? monthsToGoal : 60; // Default to 5 years if no contribution
      for (let i = 0; i <= maxMonths; i++) {
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
        projectedDate: monthlyContribution > 0 ? 
          projectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
          'Never (no contributions)',
        chartData
      };
    }).filter(Boolean) as GoalPrediction[];
    
    // Find selected prediction
    const selected = predictions.find(p => p.bucketId === selectedBucketId) || null;
    
    // Calculate total savings prediction
    const currentTotal = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    // Calculate weighted average interest rate
    const totalInterestAmount = accounts.reduce((sum, account) => {
      return sum + (account.balance * (account.interestRate || 0) / 100);
    }, 0);
    
    const weightedInterestRate = currentTotal > 0 ? (totalInterestAmount / currentTotal) * 100 : 0;
    const monthlyInterest = totalInterestAmount / 12;
    const annualInterest = totalInterestAmount;
    
    // Generate chart data for total savings growth over 5 years (60 months)
    const totalChartData: PredictionData[] = [];
    const today = new Date();
    let runningTotal = currentTotal;
    
    for (let i = 0; i <= 60; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() + i);
      
      // Add monthly contribution and interest
      if (i > 0) {
        runningTotal += monthlyContribution;
        runningTotal += (runningTotal * weightedInterestRate / 100) / 12; // Monthly interest
      }
      
      totalChartData.push({
        name: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: runningTotal
      });
    }
    
    const totalPrediction: TotalSavingsPrediction = {
      currentTotal,
      monthlyContribution,
      monthlyInterest,
      annualInterest,
      interestRate: weightedInterestRate,
      chartData: totalChartData
    };
    
    return { 
      goalPredictionsData: predictions, 
      selectedPredictionData: selected,
      totalSavingsPrediction: totalPrediction
    };
  }, [bucketsWithGoals, monthlyContribution, selectedBucketId, accounts]);

  // Use the memoized values directly instead of updating state
  // This prevents the infinite render loop

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <FaChartLine className="mr-2" /> Savings Predictions
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('buckets')}
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'buckets' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Savings Buckets
          </button>
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'total' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Total Savings
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No savings accounts found.</p>
          <p className="mt-2">Create a savings account to see predictions.</p>
        </div>
      ) : viewMode === 'total' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Contribution ($)
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={handleMonthlyContributionChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  min="0"
                  step="10"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Total Savings Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Total:</span>
                    <span className="font-medium">${totalSavingsPrediction.currentTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average Interest Rate:</span>
                    <span className="font-medium">{totalSavingsPrediction.interestRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Interest:</span>
                    <span className="font-medium text-green-600">+${totalSavingsPrediction.monthlyInterest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Annual Interest:</span>
                    <span className="font-medium text-green-600">+${totalSavingsPrediction.annualInterest.toFixed(2)}</span>
                  </div>
                  <div className="border-t dark:border-gray-600 pt-2 mt-2"></div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Contribution:</span>
                    <span className="font-medium">${totalSavingsPrediction.monthlyContribution.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">5-Year Projection:</span>
                    <span className="font-medium">
                      ${totalSavingsPrediction.chartData[60]?.value.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="h-80">
                <h3 className="font-medium mb-3 text-center">5-Year Growth Projection</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={totalSavingsPrediction.chartData.map((item, index) => ({ ...item, key: `total-chart-data-${index}` }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Projected Balance']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Projected Balance"
                      stroke="#10b981"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-3">Savings Accounts Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Annual Interest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Buckets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {accounts.map((account) => {
                    const annualInterest = account.balance * (account.interestRate || 0) / 100;
                    return (
                      <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{account.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{account.institution}</div>
                        </td>
                        <td className="px-4 py-3">${account.balance.toFixed(2)}</td>
                        <td className="px-4 py-3">{account.interestRate?.toFixed(2) || '0.00'}%</td>
                        <td className="px-4 py-3 text-green-600">+${annualInterest.toFixed(2)}</td>
                        <td className="px-4 py-3">{(account.buckets || []).length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : bucketsWithGoals.length === 0 ? (
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
                  onChange={handleMonthlyContributionChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  min="0"
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
                      <span className="font-medium">{selectedPredictionData.monthsToGoal === Infinity ? '∞' : selectedPredictionData.monthsToGoal}</span>
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
            <h3 className="font-medium mb-3">All Savings Goals</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bucket</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Goal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {goalPredictionsData.map((prediction) => {
                    const progress = prediction.goalAmount ? (prediction.currentAmount / prediction.goalAmount) * 100 : 0;
                    return (
                      <tr 
                        key={prediction.bucketId} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${prediction.bucketId === selectedBucketId ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onClick={() => setSelectedBucketId(prediction.bucketId)}
                      >
                        <td className="px-4 py-3 cursor-pointer">
                          <div className="font-medium">
                            {prediction.isEmergencyFund && <span className="mr-1">🛡️</span>}
                            {prediction.bucketName}
                          </div>
                        </td>
                        <td className="px-4 py-3 cursor-pointer">{prediction.accountName}</td>
                        <td className="px-4 py-3 cursor-pointer">${prediction.currentAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 cursor-pointer">${prediction.goalAmount?.toFixed(2)}</td>
                        <td className="px-4 py-3 cursor-pointer">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, progress)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{progress.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
