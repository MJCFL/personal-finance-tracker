// Common types used across multiple models to avoid circular dependencies

export enum BudgetCategory {
  HOUSING = 'housing',
  TRANSPORTATION = 'transportation',
  FOOD = 'food',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  HEALTHCARE = 'healthcare',
  SAVINGS = 'savings',
  PERSONAL = 'personal',
  ENTERTAINMENT = 'entertainment',
  DEBT = 'debt',
  EDUCATION = 'education',
  GIFTS = 'gifts',
  OTHER = 'other',
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}
