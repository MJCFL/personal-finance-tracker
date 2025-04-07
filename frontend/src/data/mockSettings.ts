export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    types: {
      budgetAlerts: boolean;
      unusualActivity: boolean;
      billReminders: boolean;
      goalProgress: boolean;
    };
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    currency: string;
    dateFormat: string;
    defaultView: 'transactions' | 'budgets' | 'insights';
  };
  privacy: {
    shareData: boolean;
    anonymizeTransactions: boolean;
    exportData: boolean;
  };
  categories: {
    id: string;
    name: string;
    color: string;
    icon: string;
    isCustom: boolean;
  }[];
}

export const defaultSettings: UserPreferences = {
  notifications: {
    email: true,
    push: true,
    frequency: 'weekly',
    types: {
      budgetAlerts: true,
      unusualActivity: true,
      billReminders: true,
      goalProgress: true
    }
  },
  display: {
    theme: 'system',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    defaultView: 'transactions'
  },
  privacy: {
    shareData: false,
    anonymizeTransactions: true,
    exportData: true
  },
  categories: [
    {
      id: '1',
      name: 'Groceries',
      color: '#4CAF50',
      icon: 'shopping-cart',
      isCustom: false
    },
    {
      id: '2',
      name: 'Entertainment',
      color: '#9C27B0',
      icon: 'movie',
      isCustom: false
    },
    {
      id: '3',
      name: 'Transportation',
      color: '#2196F3',
      icon: 'car',
      isCustom: false
    },
    {
      id: '4',
      name: 'Dining',
      color: '#FF9800',
      icon: 'restaurant',
      isCustom: false
    },
    {
      id: '5',
      name: 'Shopping',
      color: '#E91E63',
      icon: 'shopping-bag',
      isCustom: false
    }
  ]
};
