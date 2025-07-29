import { Budget, BudgetFormData } from '@/types/budget';

// Get all budgets for the current user
export async function getBudgets(): Promise<Budget[]> {
  const response = await fetch('/api/budgets', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch budgets');
  }

  return response.json();
}

// Get a specific budget by ID
export async function getBudgetById(id: string): Promise<Budget> {
  const response = await fetch(`/api/budgets/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch budget');
  }

  return response.json();
}

// Create a new budget
export async function createBudget(budgetData: BudgetFormData): Promise<Budget> {
  const response = await fetch('/api/budgets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(budgetData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create budget');
  }

  return response.json();
}

// Update an existing budget
export async function updateBudget(id: string, budgetData: Partial<BudgetFormData>): Promise<Budget> {
  const response = await fetch(`/api/budgets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(budgetData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update budget');
  }

  return response.json();
}

// Delete a budget
export async function deleteBudget(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/budgets/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete budget');
  }

  return response.json();
}

// Update the spent amount for a budget
export async function updateBudgetSpent(id: string, amount: number): Promise<Budget> {
  const budget = await getBudgetById(id);
  const updatedSpent = budget.spent + amount;
  
  return updateBudget(id, { 
    spent: updatedSpent 
  } as Partial<BudgetFormData>);
}
