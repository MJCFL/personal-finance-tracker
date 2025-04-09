import React from 'react';
import BudgetCard from './BudgetCard';

interface Budget {
  id: string;
  category: string;
  spent: number;
  budget: number;
  color: string;
  icon: string;
  rollover: number;
}

interface BudgetCategoriesProps {
  budgets: Budget[];
}

export default function BudgetCategories({ budgets }: BudgetCategoriesProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            category={budget.category}
            spent={budget.spent}
            budget={budget.budget}
            color={budget.color}
            icon={budget.icon}
            rollover={budget.rollover}
          />
        ))}
      </div>
    </div>
  );
}
