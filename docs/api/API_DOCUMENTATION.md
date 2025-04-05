# API Documentation - Personal Finance Tracker

## Authentication Endpoints

### User Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/profile
```

## Bank Integration (Teller API)

### Account Management
```
POST /api/accounts/connect
- Connect new bank account via Teller

GET /api/accounts/list
- List all connected accounts

GET /api/accounts/{id}/balance
- Get current balance for specific account

POST /api/accounts/sync
- Sync latest transactions
```

### Transactions

```
GET /api/transactions/list
- List all transactions
- Query params: startDate, endDate, category, account

POST /api/transactions/categorize
- Auto-categorize transactions

GET /api/transactions/search
- Search transactions
- Query params: query, category, amount
```

### Budget Management

```
POST /api/budgets/create
GET /api/budgets/list
PUT /api/budgets/{id}
DELETE /api/budgets/{id}

GET /api/budgets/progress
- Get current budget progress
```

### Analytics & Insights

```
GET /api/analytics/spending-pattern
- Get spending patterns and trends

GET /api/analytics/predictions
- Get spending predictions

GET /api/analytics/net-worth
- Calculate current net worth

GET /api/analytics/debt-analysis
- Get debt analysis and payoff projections
```

## Data Structures

### User
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "createdAt": "datetime",
  "settings": {
    "theme": "light|dark",
    "currency": "USD",
    "notifications": {
      "email": boolean,
      "push": boolean
    }
  }
}
```

### Account
```json
{
  "id": "string",
  "userId": "string",
  "tellerId": "string",
  "type": "checking|savings|credit",
  "name": "string",
  "balance": "number",
  "currency": "string",
  "lastSync": "datetime"
}
```

### Transaction
```json
{
  "id": "string",
  "accountId": "string",
  "amount": "number",
  "category": "string",
  "description": "string",
  "date": "datetime",
  "type": "debit|credit",
  "tags": ["string"]
}
```

### Budget
```json
{
  "id": "string",
  "userId": "string",
  "category": "string",
  "amount": "number",
  "period": "monthly|weekly",
  "startDate": "datetime",
  "endDate": "datetime"
}
```

## Error Handling

All API endpoints follow this error format:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
