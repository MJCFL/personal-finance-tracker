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
  PAYMENT = 'Payment',
}

// Client-side version of the AccountType enum from the Account model
export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  RETIREMENT = 'retirement',
  LOAN = 'loan',
  MORTGAGE = 'mortgage',
  OTHER = 'other',
}
