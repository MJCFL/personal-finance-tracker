export const mockSpendingPatterns = [
  {
    id: '1',
    type: 'recurring',
    description: 'Netflix Subscription',
    amount: 15.99,
    frequency: 'monthly',
    category: 'Entertainment',
    lastOccurrences: ['2025-04-05', '2025-03-05', '2025-02-05']
  },
  {
    id: '2',
    type: 'pattern',
    description: 'Weekend Dining',
    amount: 45.30,
    frequency: 'weekly',
    category: 'Dining',
    lastOccurrences: ['2025-04-06', '2025-03-30', '2025-03-23']
  }
];

export const mockAnomalies = [
  {
    id: '1',
    date: '2025-04-02',
    description: 'Unusual large grocery purchase',
    amount: 250.75,
    category: 'Groceries',
    averageAmount: 82.45,
    percentageIncrease: 204
  },
  {
    id: '2',
    date: '2025-04-01',
    description: 'Multiple entertainment expenses in one day',
    amount: 180.00,
    category: 'Entertainment',
    averageAmount: 50.00,
    percentageIncrease: 260
  }
];

export const mockRecommendations = [
  {
    id: '1',
    type: 'saving',
    title: 'Reduce Entertainment Spending',
    description: 'Your entertainment spending is 30% higher than last month. Consider setting a stricter budget.',
    potentialSavings: 45.00,
    priority: 'high',
    category: 'Entertainment'
  },
  {
    id: '2',
    type: 'budget',
    title: 'Adjust Grocery Budget',
    description: 'Your grocery spending has been consistently under budget. Consider reallocating $50 to savings.',
    potentialSavings: 50.00,
    priority: 'medium',
    category: 'Groceries'
  },
  {
    id: '3',
    type: 'recurring',
    title: 'Review Subscriptions',
    description: 'You have 3 unused subscription services. Canceling these could save $35/month.',
    potentialSavings: 35.00,
    priority: 'high',
    category: 'Subscriptions'
  }
];

export const mockSavingsGoals = [
  {
    id: '1',
    name: 'Emergency Fund',
    target: 10000,
    current: 5500,
    monthlyContribution: 500,
    projectedCompletion: '2025-09'
  },
  {
    id: '2',
    name: 'Vacation Fund',
    target: 3000,
    current: 1200,
    monthlyContribution: 300,
    projectedCompletion: '2025-08'
  }
];

export const mockCategoryInsights = [
  {
    category: 'Groceries',
    averageSpending: 420.50,
    trend: 'stable',
    percentageChange: -2,
    commonMerchants: ['Whole Foods', 'Trader Joe\'s', 'Safeway']
  },
  {
    category: 'Entertainment',
    averageSpending: 95.99,
    trend: 'increasing',
    percentageChange: 15,
    commonMerchants: ['Netflix', 'AMC Theaters', 'Spotify']
  },
  {
    category: 'Transportation',
    averageSpending: 150.30,
    trend: 'decreasing',
    percentageChange: -10,
    commonMerchants: ['Shell', 'Chevron', 'Uber']
  }
];
