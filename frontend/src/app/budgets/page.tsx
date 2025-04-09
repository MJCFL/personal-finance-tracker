'use client';

import React, { useState } from 'react';
import BudgetSummary from '@/components/budgets/BudgetSummary';
import BudgetCategories from '@/components/budgets/BudgetCategories';
import SavingsGoals from '@/components/budgets/SavingsGoals';
import CreateBudgetModal from '@/components/budgets/CreateBudgetModal';

interface Budget {
  id: string;
  category: string;
  spent: number;
  budget: number;
  color: string;
  icon: string;
  rollover: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
}

const mockBudgets: Budget[] = [
  {
    id: '1',
    category: 'Housing',
    spent: 1800,
    budget: 2000,
    color: '#3B82F6',
    icon: '🏠',
    rollover: 200
  },
  {
    id: '2',
    category: 'Food & Dining',
    spent: 850,
    budget: 800,
    color: '#10B981',
    icon: '🍽️',
    rollover: 0
  },
  {
    id: '3',
    category: 'Transportation',
    spent: 300,
    budget: 400,
    color: '#8B5CF6',
    icon: '🚗',
    rollover: 50
  },
  {
    id: '4',
    category: 'Entertainment',
    spent: 250,
    budget: 300,
    color: '#F59E0B',
    icon: '🎬',
    rollover: 0
  }
];

const mockSavingsGoals: SavingsGoal[] = [
  {
    id: '1',
    name: 'New Car',
    targetAmount: 25000,
    currentAmount: 15000,
    targetDate: '2025-12-31',
    icon: '🚗'
  },
  {
    id: '2',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 8500,
    targetDate: '2025-06-30',
    icon: '🏦'
  }
];

export default function BudgetsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const totalBudget = mockBudgets.reduce((sum, budget) => sum + budget.budget, 0);
  const totalSpent = mockBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalSavings = mockSavingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan Your Spending</h1>
          <p className="text-gray-500">Set and track your budget goals</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <span className="mr-2">+</span>
          Create Budget
        </button>
      </div>

      <BudgetSummary totalBudget={totalBudget} totalSpent={totalSpent} totalSavings={totalSavings} />
      <BudgetCategories budgets={mockBudgets} />
      <SavingsGoals goals={mockSavingsGoals} />

      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => {
          console.log('New budget:', data);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}
