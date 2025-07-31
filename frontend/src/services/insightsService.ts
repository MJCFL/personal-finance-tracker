import { getSession } from 'next-auth/react';
import { TransactionType } from '@/types/commonTypes';
import { getTransactions } from './transactionService';
import { getAssets } from './assetService';
import { getAccounts } from './accountService';

export interface SpendingPattern {
  id: string;
  type: 'recurring' | 'pattern';
  description: string;
  amount: number;
  frequency: string;
  category: string;
  lastOccurrences: string[];
}

export interface Anomaly {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  averageAmount: number;
  percentageIncrease: number;
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  monthlyContribution: number;
  projectedCompletion: string;
}

export interface CategoryInsight {
  category: string;
  averageSpending: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  commonMerchants: string[];
}

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get spending patterns based on transaction history
export async function getSpendingPatterns(): Promise<SpendingPattern[]> {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }

    // Get transactions from the last 3 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    const { transactions } = await getTransactions({ startDate, endDate });
    
    // This is a simplified implementation - in a real app, you would use more
    // sophisticated pattern detection algorithms
    
    // Group transactions by merchant and category
    const merchantGroups: Record<string, any[]> = {};
    
    transactions.forEach(transaction => {
      if (!transaction.merchant) return;
      
      const key = `${transaction.merchant}-${transaction.category}`;
      if (!merchantGroups[key]) {
        merchantGroups[key] = [];
      }
      merchantGroups[key].push(transaction);
    });
    
    // Find recurring transactions (same merchant, similar amount, regular interval)
    const patterns: SpendingPattern[] = [];
    
    Object.entries(merchantGroups).forEach(([key, txns]) => {
      // Only consider groups with at least 2 transactions
      if (txns.length >= 2) {
        // Sort by date
        txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Check if amounts are similar (within 5% variance)
        const amounts = txns.map(t => t.amount);
        const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        
        const allSimilarAmounts = amounts.every(amount => 
          Math.abs(amount - avgAmount) / avgAmount < 0.05
        );
        
        if (allSimilarAmounts) {
          // Get the merchant and category from the first transaction
          const [merchant, category] = key.split('-');
          
          // Determine frequency (monthly, weekly, etc.)
          // This is simplified - a real implementation would be more sophisticated
          let frequency = 'unknown';
          if (txns.length >= 3) {
            const dates = txns.map(t => new Date(t.date).getTime());
            const intervals = [];
            for (let i = 1; i < dates.length; i++) {
              intervals.push(Math.abs(dates[i] - dates[i-1]));
            }
            
            const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
            const daysDiff = avgInterval / (1000 * 60 * 60 * 24);
            
            if (daysDiff >= 25 && daysDiff <= 35) frequency = 'monthly';
            else if (daysDiff >= 6 && daysDiff <= 8) frequency = 'weekly';
            else if (daysDiff >= 13 && daysDiff <= 16) frequency = 'biweekly';
          }
          
          patterns.push({
            id: generateId(),
            type: 'recurring',
            description: merchant,
            amount: avgAmount,
            frequency,
            category: category || 'Other',
            lastOccurrences: txns.slice(0, 3).map(t => formatDate(new Date(t.date)))
          });
        }
      }
    });
    
    return patterns;
  } catch (error) {
    console.error('Error fetching spending patterns:', error);
    return [];
  }
}

// Get spending anomalies based on transaction history
export async function getAnomalies(): Promise<Anomaly[]> {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }

    // Get transactions from the last 3 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    const { transactions } = await getTransactions({ startDate, endDate });
    
    // Group transactions by category
    const categoryGroups: Record<string, any[]> = {};
    
    transactions.forEach(transaction => {
      if (!transaction.category || transaction.type !== TransactionType.EXPENSE) return;
      
      if (!categoryGroups[transaction.category]) {
        categoryGroups[transaction.category] = [];
      }
      categoryGroups[transaction.category].push(transaction);
    });
    
    // Find anomalies (transactions that are significantly higher than average)
    const anomalies: Anomaly[] = [];
    
    Object.entries(categoryGroups).forEach(([category, txns]) => {
      // Calculate average spending for this category
      const amounts = txns.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      
      // Find transactions that are at least 50% higher than average
      const anomalousTxns = txns.filter(t => t.amount > avgAmount * 1.5);
      
      anomalousTxns.forEach(txn => {
        const percentIncrease = Math.round(((txn.amount - avgAmount) / avgAmount) * 100);
        
        anomalies.push({
          id: generateId(),
          date: formatDate(new Date(txn.date)),
          description: `Unusual ${category.toLowerCase()} expense${txn.merchant ? ` at ${txn.merchant}` : ''}`,
          amount: txn.amount,
          category,
          averageAmount: avgAmount,
          percentageIncrease: percentIncrease
        });
      });
    });
    
    // Sort by percentage increase (highest first)
    return anomalies.sort((a, b) => b.percentageIncrease - a.percentageIncrease).slice(0, 5);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return [];
  }
}

// Get personalized financial recommendations
export async function getRecommendations(): Promise<Recommendation[]> {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }

    const recommendations: Recommendation[] = [];
    
    // Get transactions from the last 2 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);
    
    const { transactions } = await getTransactions({ startDate, endDate });
    const { assets } = await getAssets();
    const { accounts } = await getAccounts();
    
    // Calculate total liquid assets (cash + checking + savings)
    const liquidAssets = accounts && accounts.length > 0 ? accounts.reduce((sum, account) => {
      if (['Checking', 'Savings', 'Cash'].includes(account.type)) {
        return sum + account.balance;
      }
      return sum;
    }, 0) : 0;
    
    // Calculate monthly expenses
    const currentMonth = new Date().getMonth();
    const lastMonth = (currentMonth - 1 + 12) % 12;
    
    const currentMonthExpenses = transactions && transactions.length > 0 ? transactions
      .filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0) : 0;
    
    const lastMonthExpenses = transactions && transactions.length > 0 ? transactions
      .filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === lastMonth)
      .reduce((sum, t) => sum + t.amount, 0) : 0;
    
    // Group expenses by category for the current month
    const categoryExpenses: Record<string, number> = {};
    if (transactions && transactions.length > 0) {
      transactions
        .filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === currentMonth)
        .forEach(t => {
          const category = t.category || 'Other';
          categoryExpenses[category] = (categoryExpenses[category] || 0) + t.amount;
        });
    }
    
    // 1. Emergency fund recommendation
    const monthlyExpenses = (currentMonthExpenses + lastMonthExpenses) / 2;
    const recommendedEmergencyFund = monthlyExpenses * 6; // 6 months of expenses
    
    if (liquidAssets < recommendedEmergencyFund) {
      const shortfall = recommendedEmergencyFund - liquidAssets;
      recommendations.push({
        id: generateId(),
        type: 'saving',
        title: 'Build Emergency Fund',
        description: `Your emergency fund is below the recommended 6 months of expenses. Consider increasing your savings.`,
        potentialSavings: 0, // This is not a direct saving
        priority: shortfall > monthlyExpenses * 3 ? 'high' : 'medium',
        category: 'Savings'
      });
    }
    
    // 2. Check for high spending categories
    Object.entries(categoryExpenses).forEach(([category, amount]) => {
      // If a single category is more than 30% of total expenses, suggest reduction
      if (amount > currentMonthExpenses * 0.3 && currentMonthExpenses > 0) {
        const suggestedReduction = amount * 0.1; // Suggest 10% reduction
        
        recommendations.push({
          id: generateId(),
          type: 'budget',
          title: `Reduce ${category} Spending`,
          description: `Your ${category} spending is ${Math.round(amount / currentMonthExpenses * 100)}% of your total expenses. Consider setting a stricter budget.`,
          potentialSavings: suggestedReduction,
          priority: 'medium',
          category
        });
      }
    });
    
    // 3. Check for spending increase
    if (currentMonthExpenses > lastMonthExpenses * 1.2) {
      // Spending increased by more than 20%
      const increase = currentMonthExpenses - lastMonthExpenses;
      
      recommendations.push({
        id: generateId(),
        type: 'alert',
        title: 'Spending Increase Alert',
        description: `Your spending this month is ${Math.round((currentMonthExpenses / lastMonthExpenses - 1) * 100)}% higher than last month. Review your expenses to identify areas to cut back.`,
        potentialSavings: increase * 0.5, // Suggest cutting back half of the increase
        priority: 'high',
        category: 'Overall'
      });
    }
    
    // 4. Investment diversification check
    const investmentAssets = assets && assets.length > 0 ? assets.filter(a => a.type === 'Stock' || a.type === 'Bond' || a.type === 'ETF' || a.type === 'Crypto') : [];
    
    if (investmentAssets.length > 0) {
      // Check if any single investment is more than 20% of portfolio
      const totalInvestments = investmentAssets.reduce((sum, asset) => sum + asset.value, 0);
      
      investmentAssets.forEach(asset => {
        if (asset.value > totalInvestments * 0.2) {
          recommendations.push({
            id: generateId(),
            type: 'investment',
            title: 'Diversify Investments',
            description: `${asset.name} represents ${Math.round(asset.value / totalInvestments * 100)}% of your investment portfolio. Consider diversifying to reduce risk.`,
            potentialSavings: 0, // This is risk reduction, not direct saving
            priority: 'medium',
            category: 'Investments'
          });
        }
      });
    }
    
    // Sort by priority (high first)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

// Get savings goals progress
export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }
    
    // In a real app, you would fetch actual savings goals from the database
    // For now, we'll create some placeholder goals based on account data
    
    const { accounts } = await getAccounts();
    
    // Find savings accounts
    const savingsAccounts = accounts && accounts.length > 0 ? accounts.filter(account => 
      account.type === 'Savings' || account.name.toLowerCase().includes('saving')
    ) : [];
    
    if (savingsAccounts.length === 0) {
      return [];
    }
    
    // Create placeholder goals based on savings accounts
    const goals: SavingsGoal[] = [];
    
    // Get transactions from the last 3 months to estimate monthly contributions
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    const { transactions } = await getTransactions({ startDate, endDate });
    
    savingsAccounts.forEach((account, index) => {
      // Calculate average monthly contribution to this account
      const deposits = transactions.filter(t => 
        t.toAccount === account.id && t.type === TransactionType.TRANSFER
      );
      
      let monthlyContribution = 0;
      if (deposits.length > 0) {
        const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
        monthlyContribution = totalDeposits / 3; // Average over 3 months
      }
      
      // Create a placeholder goal
      const goalNames = ['Emergency Fund', 'Vacation Fund', 'Home Down Payment', 'New Car', 'Education'];
      const goalName = goalNames[index % goalNames.length];
      
      // Set target to current balance plus 50%
      const target = account.balance * 1.5;
      
      // Calculate projected completion date
      let projectedCompletion = '';
      if (monthlyContribution > 0) {
        const remainingAmount = target - account.balance;
        const monthsToComplete = Math.ceil(remainingAmount / monthlyContribution);
        
        const completionDate = new Date();
        completionDate.setMonth(completionDate.getMonth() + monthsToComplete);
        projectedCompletion = `${completionDate.getFullYear()}-${String(completionDate.getMonth() + 1).padStart(2, '0')}`;
      } else {
        projectedCompletion = 'N/A';
      }
      
      goals.push({
        id: generateId(),
        name: goalName,
        target,
        current: account.balance,
        monthlyContribution,
        projectedCompletion
      });
    });
    
    return goals;
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return [];
  }
}

// Get category insights
export async function getCategoryInsights(): Promise<CategoryInsight[]> {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }

    // Get transactions from the last 3 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    const { transactions } = await getTransactions({ startDate, endDate });
    
    // Filter to expense transactions only
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    // Group by category
    const categories: Record<string, any> = {};
    
    expenses.forEach(transaction => {
      const category = transaction.category || 'Other';
      
      if (!categories[category]) {
        categories[category] = {
          totalSpending: 0,
          transactions: [],
          merchants: {}
        };
      }
      
      categories[category].totalSpending += transaction.amount;
      categories[category].transactions.push(transaction);
      
      // Track merchants
      if (transaction.merchant) {
        categories[category].merchants[transaction.merchant] = 
          (categories[category].merchants[transaction.merchant] || 0) + 1;
      }
    });
    
    // Calculate insights for each category
    const insights: CategoryInsight[] = [];
    
    // Get current month and previous month
    const currentMonth = new Date().getMonth();
    const previousMonth = (currentMonth - 1 + 12) % 12;
    
    Object.entries(categories).forEach(([category, data]) => {
      // Skip categories with too few transactions
      if (data.transactions.length < 3) return;
      
      // Calculate average monthly spending
      const averageSpending = data.totalSpending / 3;
      
      // Calculate trend by comparing current month vs previous month
      const currentMonthSpending = data.transactions
        .filter(t => new Date(t.date).getMonth() === currentMonth)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const previousMonthSpending = data.transactions
        .filter(t => new Date(t.date).getMonth() === previousMonth)
        .reduce((sum, t) => sum + t.amount, 0);
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      let percentageChange = 0;
      
      if (previousMonthSpending > 0) {
        percentageChange = Math.round(((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100);
        
        if (percentageChange > 10) trend = 'increasing';
        else if (percentageChange < -10) trend = 'decreasing';
      }
      
      // Get top merchants
      const merchantEntries = Object.entries(data.merchants);
      merchantEntries.sort((a, b) => b[1] - a[1]);
      const commonMerchants = merchantEntries.slice(0, 3).map(entry => entry[0]);
      
      insights.push({
        category,
        averageSpending,
        trend,
        percentageChange,
        commonMerchants
      });
    });
    
    // Sort by average spending (highest first)
    return insights.sort((a, b) => b.averageSpending - a.averageSpending);
  } catch (error) {
    console.error('Error fetching category insights:', error);
    return [];
  }
}
