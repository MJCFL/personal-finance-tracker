import { Budget, BudgetFormData, BudgetCategory } from '@/types/budget';
import { TransactionType } from '@/types/commonTypes';
import Cookies from 'js-cookie';
import eventEmitter, { FINANCIAL_DATA_CHANGED, TRANSACTION_CHANGED } from '@/utils/eventEmitter';

// Import the transaction service at the top level to avoid circular dependency issues
import { getTransactions } from '@/services/transactionService';

// Subscribe to transaction changes to update budgets automatically
eventEmitter.on(TRANSACTION_CHANGED, async () => {
  console.log('Transaction changed event received in budgetService, updating budget spending');
  try {
    // Get all budgets
    const budgets = await getBudgets();
    console.log(`Found ${budgets.length} budgets to update after transaction change`);
    
    // Update spending for each budget based on transactions
    for (const budget of budgets) {
      console.log(`Calculating spending for budget: ${budget.name} (${budget.category})`);
      const spent = await calculateBudgetSpendingFromTransactions(budget);
      console.log(`Budget ${budget.name}: Current spent=${budget.spent}, Calculated spent=${spent}`);
      
      if (spent !== budget.spent) {
        // Only update if the spent amount has changed
        console.log(`Updating budget ${budget.name} spent amount from ${budget.spent} to ${spent}`);
        // Use the direct API call to update just the spent amount
        const response = await fetch(`/api/budgets/${budget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spent })
        });
        
        if (!response.ok) {
          console.error(`Failed to update budget ${budget.id} spent amount:`, await response.text());
        } else {
          console.log(`Successfully updated budget ${budget.name} spent amount to ${spent}`);
        }
      }
    }
    
    // Emit financial data changed event to trigger UI refresh
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
  } catch (error) {
    console.error('Error updating budgets after transaction change:', error);
  }
});

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
  
  try {
    const response = await fetch('/api/budgets');
    
    if (!response.ok) {
      throw new Error('Failed to fetch budgets');
    }
    
    const data = await response.json();
    
    // Calculate spending from transactions for each budget
    const budgetsWithCalculatedSpending = await Promise.all(
      data.map(async (budget: Budget) => {
        try {
          // Calculate spending from transactions
          const calculatedSpent = await calculateBudgetSpendingFromTransactions(budget);
          
          // Return budget with calculated spending
          return {
            ...budget,
            spent: calculatedSpent
          };
        } catch (error) {
          console.error(`Error calculating spending for budget ${budget.id}:`, error);
          // Return original budget if calculation fails
          return budget;
        }
      })
    );
    
    return budgetsWithCalculatedSpending;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
}

// Get a specific budget by ID
export async function getBudgetById(id: string): Promise<Budget | null> {
  console.log('budgetService: Getting budget by ID:', id);
  
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.getBudgetById(id);
  }
  
  // Ensure the ID is properly formatted
  const budgetId = id.toString();
  
  try {
    // First try to get all budgets and find the one with matching ID
    // This is a workaround for potential ID format mismatches
    console.log('budgetService: Trying to find budget in all budgets list');
    const allBudgets = await getBudgets();
    
    // Look for the budget with matching ID (case insensitive)
    const matchingBudget = allBudgets.find(budget => 
      budget.id.toLowerCase() === budgetId.toLowerCase() ||
      budget.id.toString() === budgetId
    );
    
    if (matchingBudget) {
      console.log('budgetService: Found budget in all budgets list:', matchingBudget);
      return matchingBudget;
    }
    
    // If not found in the list, try direct API call
    console.log('budgetService: Budget not found in list, trying direct API call');
    const response = await fetch(`/api/budgets/${budgetId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('budgetService: Budget not found with ID:', budgetId);
        return null;
      }
      const errorData = await response.json();
      console.error('budgetService: Error fetching budget:', errorData);
      throw new Error(errorData.error || 'Failed to fetch budget');
    }
    
    const budget = await response.json();
    console.log('budgetService: Successfully retrieved budget from API:', budget);
    return budget;
  } catch (error) {
    console.error('budgetService: Exception during getBudgetById:', error);
    throw error;
  }
}

// Create a new budget
export async function createBudget(budgetData: BudgetFormData): Promise<Budget> {
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    const result = demoBudgetService.createBudget(budgetData);
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    return result;
  }
  
  // Validate required fields
  if (!budgetData.name || budgetData.name.trim() === '') {
    throw new Error('Budget name is required');
  }
  
  if (budgetData.amount < 0) {
    throw new Error('Budget amount cannot be negative');
  }
  
  // Ensure dates are properly formatted as ISO strings
  // Make sure we have a valid date object first
  let startDate: Date;
  try {
    startDate = new Date(budgetData.startDate);
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid start date');
    }
  } catch (error) {
    throw new Error('Invalid start date format');
  }
  
  // Check end date if provided
  let endDate: Date | undefined;
  if (budgetData.endDate && budgetData.endDate.trim() !== '') {
    try {
      endDate = new Date(budgetData.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date');
      }
    } catch (error) {
      throw new Error('Invalid end date format');
    }
  }
  
  // Create a properly formatted data object
  const formattedData = {
    ...budgetData,
    startDate: startDate.toISOString(),
    endDate: endDate ? endDate.toISOString() : undefined,
    // Initialize spent to 0, will be updated with actual transactions after creation
    spent: 0
  };
  
  console.log('Sending budget data to API:', formattedData);
  
  const response = await fetch('/api/budgets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedData),
    // Ensure credentials are included for authentication cookies
    credentials: 'include'
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.error('Budget API error response:', errorData);
    } catch (e) {
      console.error('Failed to parse error response:', e);
      errorData = { error: `HTTP error ${response.status}` };
    }
    
    // Handle authentication errors specifically
    if (response.status === 401) {
      throw new Error('Authentication required. Please sign in to create a budget.');
    }
    
    // Create a custom error object with validation details
    const error: any = new Error(errorData.error || 'Failed to create budget');
    
    // Add validation errors if present
    if (errorData.validationErrors) {
      error.validationErrors = errorData.validationErrors;
    }
    
    throw error;
  }

  const result = await response.json();
  
  // Calculate initial spending from existing transactions
  try {
    console.log('Calculating initial spending for new budget:', result.name);
    const initialSpent = await calculateBudgetSpendingFromTransactions(result);
    if (initialSpent > 0) {
      console.log(`New budget ${result.name} has initial spending of ${initialSpent} from existing transactions`);
      // Update the budget with the calculated spending
      await fetch(`/api/budgets/${result.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spent: initialSpent })
      });
      // Update the result object with the calculated spending
      result.spent = initialSpent;
    }
  } catch (calcError) {
    console.error('Error calculating initial budget spending:', calcError);
    // Continue with the budget creation even if spending calculation fails
  }
  
  // Emit event to notify that financial data has changed
  eventEmitter.emit(FINANCIAL_DATA_CHANGED);
  
  return result;
}

// Update an existing budget
export async function updateBudget(id: string, budgetData: Partial<BudgetFormData>): Promise<Budget> {
  console.log('budgetService: Updating budget with ID:', id);
  
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    const result = demoBudgetService.updateBudget(id, budgetData);
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    return result;
  }
  
  try {
    // First verify the budget exists before attempting to update
    const existingBudget = await getBudgetById(id);
    if (!existingBudget) {
      console.error('budgetService: Budget not found before update attempt:', id);
      throw new Error(`Budget not found with ID: ${id}`);
    }
    
    console.log('budgetService: Found existing budget before update:', existingBudget);
    
    // Ensure the ID is properly formatted
    const budgetId = existingBudget.id.toString();
    console.log('budgetService: Using verified budgetId for update:', budgetId);
    
    const response = await fetch(`/api/budgets/${budgetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...budgetData,
        // Include the ID in the body as well to ensure consistency
        id: budgetId
      }),
    });

    if (!response.ok) {
      let errorMessage = `Failed to update budget: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('budgetService: Update failed with status:', response.status, 'Error:', errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('budgetService: Could not parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('budgetService: Update successful, result:', result);
    
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return result;
  } catch (error) {
    console.error('budgetService: Exception during update:', error);
    throw error;
  }
}

// Delete a budget
export async function deleteBudget(id: string): Promise<{ message: string }> {
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.deleteBudget(id);
  }
  
  try {
    console.log(`Attempting to delete budget with ID: ${id}`);
    
    const response = await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Delete budget error response:', error);
      throw new Error(error.error || 'Failed to delete budget');
    }
    
    const result = await response.json();
    
    // Emit event to notify that financial data has changed
    eventEmitter.emit(FINANCIAL_DATA_CHANGED);
    
    return result;
  } catch (error) {
    console.error(`Error deleting budget with ID ${id}:`, error);
    throw error;
  }
}

// Calculate budget spending from transactions based on matching category
export async function calculateBudgetSpendingFromTransactions(budget: Budget): Promise<number> {
  try {
    // Get the budget period dates
    const startDate = new Date(budget.startDate);
    let endDate = budget.endDate ? new Date(budget.endDate) : new Date();
    
    // If this is a recurring budget, calculate the current period
    if (budget.isRecurring) {
      const now = new Date();
      
      // Calculate current period start and end dates
      switch (budget.period) {
        case 'monthly':
          // Current month period
          startDate.setDate(1);
          startDate.setMonth(now.getMonth());
          startDate.setFullYear(now.getFullYear());
          
          endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0); // Last day of the month
          break;
          
        case 'yearly':
          // Current year period
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setFullYear(now.getFullYear());
          
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
          endDate.setDate(0); // Last day of the year
          break;
          
        case 'weekly':
          // Current week period
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
          
          startDate.setDate(diff);
          startDate.setMonth(now.getMonth());
          startDate.setFullYear(now.getFullYear());
          
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          break;
      }
    }
    
    console.log(`Fetching transactions for budget ${budget.name} (${budget.category})`);
    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Get transactions that match the budget category and time period
    const response = await getTransactions({
      category: budget.category,
      type: TransactionType.EXPENSE, // Use enum value to match database values
      startDate: startDate,
      endDate: endDate
    });
    
    console.log(`Found ${response.transactions.length} matching transactions for budget ${budget.name}`);
    
    // Debug transaction data
    if (response.transactions.length > 0) {
      console.log('Sample transaction:', response.transactions[0]);
    }
    
    // Calculate total spending from matching transactions
    const totalSpent = response.transactions.reduce((sum, transaction) => {
      // Ensure amount is treated as a number and is positive
      const amount = typeof transaction.amount === 'string' ? 
                    parseFloat(transaction.amount) : 
                    Math.abs(transaction.amount);
      return sum + amount;
    }, 0);
    
    console.log(`Budget ${budget.name}: Calculated spending of ${totalSpent} from ${response.transactions.length} transactions`);
    return totalSpent;
  } catch (error) {
    console.error('Error calculating budget spending from transactions:', error);
    // Return current spent amount as fallback
    return budget.spent;
  }
}

// Update the spent amount for a budget (DEPRECATED - will be removed)
export async function updateBudgetSpent(id: string, amount: number): Promise<Budget> {
  // Use demo service if in demo mode
  if (isInDemoMode()) {
    return demoBudgetService.updateBudgetSpent(id, amount);
  }
  
  const budget = await getBudgetById(id);
  if (!budget) {
    throw new Error(`Budget not found with ID: ${id}`);
  }
  const updatedSpent = budget.spent + amount;
  
  return updateBudget(id, { 
    spent: updatedSpent 
  } as Partial<BudgetFormData>);
}
