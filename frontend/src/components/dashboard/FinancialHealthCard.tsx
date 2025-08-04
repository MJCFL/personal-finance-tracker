"use client";

import React, { useState, useEffect } from 'react';
import { getAccounts } from '@/services/accountService';
import { getTransactions } from '@/services/transactionService';
import { TransactionType } from '@/types/commonTypes';

interface HealthMetric {
  name: string;
  score: number;
  status: 'good' | 'warning' | 'danger';
  description: string;
}

export default function FinancialHealthCard() {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchHealthData() {
      try {
        setLoading(true);
        
        // Fetch accounts and transactions to calculate health metrics
        const accountsResponse = await getAccounts();
        const accounts = accountsResponse.accounts || [];
        
        // Get transactions from the last 3 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        
        const { transactions } = await getTransactions({ startDate, endDate });
        
        // Only calculate metrics if we have data
        if (!accounts || !Array.isArray(accounts) || accounts.length === 0 || !transactions || transactions.length === 0) {
          setHealthMetrics([]);
          return;
        }
        
        const metrics: HealthMetric[] = [];
        
        // Calculate metrics based on real data
        // 1. Savings Rate
        const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Find transfers to savings accounts
        const savingsTransactions = transactions.filter(t => 
          t.type === TransactionType.TRANSFER && 
          accounts.some((a: any) => a.id === t.accountId && a.type === 'savings')
        );
        const totalSavings = savingsTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        if (totalIncome > 0) {
          const savingsRate = (totalSavings / totalIncome) * 100;
          let savingsStatus: 'good' | 'warning' | 'danger' = 'danger';
          
          if (savingsRate >= 20) savingsStatus = 'good';
          else if (savingsRate >= 10) savingsStatus = 'warning';
          
          metrics.push({
            name: 'Savings Rate',
            score: Math.min(Math.round(savingsRate * 5), 100), // Scale for score
            status: savingsStatus,
            description: `You're saving ${savingsRate.toFixed(1)}% of your income`
          });
        }
        
        // 2. Total Savings Account Value
        const savingsAccounts = accounts.filter((a: any) => a.type === 'savings');
        const totalSavingsBalance = savingsAccounts.reduce((sum: number, account: any) => sum + (account.balance || 0), 0);
        
        // Calculate recommended emergency fund (3-6 months of expenses)
        const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
        const monthlyExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / 3; // Average monthly expenses
        const recommendedEmergencyFund = monthlyExpenses * 6; // 6 months of expenses
        
        if (monthlyExpenses > 0) {
          let savingsStatus: 'good' | 'warning' | 'danger' = 'danger';
          const savingsRatio = totalSavingsBalance / recommendedEmergencyFund;
          
          if (savingsRatio >= 1) savingsStatus = 'good'; // Has 6+ months of expenses saved
          else if (savingsRatio >= 0.5) savingsStatus = 'warning'; // Has 3+ months of expenses saved
          
          const savingsScore = Math.min(Math.round(savingsRatio * 100), 100);
          
          metrics.push({
            name: 'Emergency Fund',
            score: savingsScore,
            status: savingsStatus,
            description: `You have ${(savingsRatio * 6).toFixed(1)} months of expenses saved`
          });
        }
        
        // 3. Debt-to-Income Ratio
        const debtAccounts = accounts.filter((a: any) => ['credit_card', 'loan', 'mortgage'].includes(a.type));
        const totalDebt = debtAccounts.reduce((sum: number, account: any) => sum + (account.balance || 0), 0);
        
        if (totalIncome > 0 && totalDebt > 0) {
          // Monthly debt payments (estimated as 3% of total debt as a simplification)
          const estimatedMonthlyDebtPayment = totalDebt * 0.03;
          const monthlyIncome = totalIncome / 3; // Average monthly income from 3 months
          
          const debtToIncomeRatio = estimatedMonthlyDebtPayment / monthlyIncome;
          let debtStatus: 'good' | 'warning' | 'danger' = 'good';
          
          if (debtToIncomeRatio > 0.43) debtStatus = 'danger'; // Above 43% DTI is problematic
          else if (debtToIncomeRatio > 0.36) debtStatus = 'warning'; // 36-43% is concerning
          
          // Lower ratio is better, so invert the score
          const debtScore = Math.max(Math.round(100 - (debtToIncomeRatio * 200)), 0);
          
          metrics.push({
            name: 'Debt-to-Income',
            score: debtScore,
            status: debtStatus,
            description: `Your debt payments are ${(debtToIncomeRatio * 100).toFixed(1)}% of income`
          });
        }
        
        setHealthMetrics(metrics);
      } catch (err) {
        console.error('Error fetching health metrics:', err);
        setError('Failed to load health metrics');
      } finally {
        setLoading(false);
      }
    }
    
    fetchHealthData();
  }, []);
  
  // Calculate overall score or use default
  const overallScore = healthMetrics.length > 0 ?
    Math.round(healthMetrics.reduce((sum, metric) => sum + metric.score, 0) / healthMetrics.length) :
    0; // Default score when no metrics available

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
        {loading ? (
          <p className="text-sm text-gray-500">Loading health metrics...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : healthMetrics.length === 0 ? (
          <p className="text-sm text-gray-500">No health metrics available yet. Add transactions and accounts to see insights.</p>
        ) : (
          healthMetrics.map((metric: HealthMetric) => (
            <div key={metric.name} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
              <div className={`px-3 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                <span className="text-sm font-medium">{metric.score}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
