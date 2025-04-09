import React from 'react';
import SavingsGoalCard from './SavingsGoalCard';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
}

interface SavingsGoalsProps {
  goals: SavingsGoal[];
}

export default function SavingsGoals({ goals }: SavingsGoalsProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Savings Goals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <SavingsGoalCard
            key={goal.id}
            name={goal.name}
            targetAmount={goal.targetAmount}
            currentAmount={goal.currentAmount}
            targetDate={goal.targetDate}
            icon={goal.icon}
          />
        ))}
      </div>
    </div>
  );
}
