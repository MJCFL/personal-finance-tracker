// Common types used across multiple models to avoid circular dependencies

export enum BudgetCategory {
  HOUSING = 'Housing',
  TRANSPORTATION = 'Transportation',
  FOOD = 'Food',
  UTILITIES = 'Utilities',
  INSURANCE = 'Insurance',
  HEALTHCARE = 'Healthcare',
  SAVINGS = 'Savings',
  PERSONAL = 'Personal',
  ENTERTAINMENT = 'Entertainment',
  DEBT = 'Debt',
  EDUCATION = 'Education',
  GIFTS = 'Gifts',
  INCOME = 'Income',
  OTHER = 'Other',
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  TRANSFER = 'Transfer',
}
