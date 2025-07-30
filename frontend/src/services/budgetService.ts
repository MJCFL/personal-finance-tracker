import { Budget, BudgetFormData, BudgetCategory } from '@/types/budget';
import Cookies from 'js-cookie';

// Demo budget data
const demoBudgets: Budget[] = [
  {
    id: 'demo-budget-1',
    userId: 'demo-user',
    name: 'Groceries',
    category: BudgetCategory.FOOD,
    amount: 500,
    spent: 320,
    period: 'monthly',
    startDate: new Date().toISOString(),
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-budget-2',
    userId: 'demo-user',
    name: 'Entertainment',
    category: BudgetCategory.ENTERTAINMENT,
    amount: 200,
    spent: 150,
    period: 'monthly',
    startDate: new Date().toISOString(),
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-budget-3',
    userId: 'demo-user',
    name: 'Transportation',
    category: BudgetCategory.TRANSPORTATION,
    amount: 300,
    spent: 210,
    period: 'monthly',
    startDate: new Date().toISOString(),
    isRecurring: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Demo budget service
export const demoBudgetService = {
  // Get all budgets
  getBudgets: () => {
    return Promise.resolve([...demoBudgets]);
  },
  
  // Get budget by ID
  getBudgetById: (id: string) => {
    const budget = demoBudgets.find(b => b.id === id);
    if (!budget) {
      return Promise.reject(new Error('Budget not found'));
    }
    return Promise.resolve({...budget});
  },
  
  // Create budget
  createBudget: (budgetData: BudgetFormData) => {
    const newBudget: Budget = {
      id: `demo-budget-${Date.now()}`,
      userId: 'demo-user',
      ...budgetData,
      spent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    demoBudgets.push(newBudget);
    return Promise.resolve({...newBudget});
  },
  
  // Update budget
  updateBudget: (id: string, budgetData: Partial<BudgetFormData>) => {
    const index = demoBudgets.findIndex(b => b.id === id);
    if (index === -1) return Promise.reject(new Error('Budget not found'));
    
    const updatedBudget = {
      ...demoBudgets[index],
      ...budgetData,
      updatedAt: new Date().toISOString()
    };
    
    demoBudgets[index] = updatedBudget;
    return Promise.resolve({...updatedBudget});
  },
  
  // Delete budget
  deleteBudget: (id: string) => {
    const index = demoBudgets.findIndex(b => b.id === id);
    if (index === -1) return Promise.reject(new Error('Budget not found'));
    
    demoBudgets.splice(index, 1);
    return Promise.resolve({ message: 'Budget deleted successfully' });
  },
  
  // Update budget spent amount
  updateBudgetSpent: (id: string, amount: number) => {
    const index = demoBudgets.findIndex(b => b.id === id);
    if (index === -1) return Promise.reject(new Error('Budget not found'));
    
    const updatedBudget = {
      ...demoBudgets[index],
      spent: demoBudgets[index].spent + amount,
      updatedAt: new Date().toISOString()
    };
    
    demoBudgets[index] = updatedBudget;
    return Promise.resolve({...updatedBudget});
  }
};



// Check if in demo mode
function isInDemoMode(): boolean {
  return Cookies.get('demoMode') === 'true';
}

// Get all budgets for the current user
export async function getBudgets(): Promise<Budget[]> {
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.getBudgets();
  }
  
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
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.getBudgetById(id);
  }
  
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
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.createBudget(budgetData);
  }
  
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
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.updateBudget(id, budgetData);
  }
  
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
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.deleteBudget(id);
  }
  
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
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.updateBudgetSpent(id, amount);
  }
  
  const budget = await getBudgetById(id);
  const updatedSpent = budget.spent + amount;
  
  return updateBudget(id, { 
    spent: updatedSpent 
  } as Partial<BudgetFormData>);
}
