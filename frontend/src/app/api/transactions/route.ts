import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import Budget from '@/models/Budget';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TransactionType } from '@/types/commonTypes';

// GET handler to fetch all transactions for the current user
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const url = new URL(req.url);
    const accountId = url.searchParams.get('accountId');
    const budgetId = url.searchParams.get('budgetId');
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 50;
    const skip = url.searchParams.get('skip') ? parseInt(url.searchParams.get('skip')!) : 0;

    // Build query based on parameters
    const query: any = { userId: session.user.id };
    if (accountId) query.accountId = accountId;
    if (budgetId) query.budgetId = budgetId;
    if (category) query.category = category;
    if (type) query.type = type;
    
    // Handle date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Fetch transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('accountId', 'name type');

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Map MongoDB _id to id for frontend compatibility
    const mappedTransactions = transactions.map(transaction => {
      const transactionObj = transaction.toObject();
      transactionObj.id = transactionObj._id.toString();
      delete transactionObj._id;
      return transactionObj;
    });

    return NextResponse.json({
      transactions: mappedTransactions,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST handler to create a new transaction
export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Verify account ownership
    const account = await Account.findById(body.accountId);
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    if (account.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have access to this account' },
        { status: 403 }
      );
    }

    // For payment transactions, verify target account ownership and type
    if (body.type === TransactionType.PAYMENT) {
      if (!body.targetAccountId) {
        return NextResponse.json(
          { error: 'Target account is required for payment transactions' },
          { status: 400 }
        );
      }

      const targetAccount = await Account.findById(body.targetAccountId);
      if (!targetAccount) {
        return NextResponse.json(
          { error: 'Target account not found' },
          { status: 404 }
        );
      }

      if (targetAccount.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized: You do not have access to this target account' },
          { status: 403 }
        );
      }

      // Verify target account is a liability account (credit card, loan, mortgage)
      const validLiabilityTypes = ['credit_card', 'loan', 'mortgage'];
      if (!validLiabilityTypes.includes(targetAccount.type)) {
        return NextResponse.json(
          { error: 'Target account must be a liability account (credit card, loan, or mortgage)' },
          { status: 400 }
        );
      }
    }

    // If budget is specified, verify budget ownership
    if (body.budgetId) {
      const budget = await Budget.findById(body.budgetId);
      if (!budget) {
        return NextResponse.json(
          { error: 'Budget not found' },
          { status: 404 }
        );
      }
      
      if (budget.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized: You do not have access to this budget' },
          { status: 403 }
        );
      }

      // Update budget spent amount if it's an expense or payment
      if (body.type === TransactionType.EXPENSE || body.type === TransactionType.PAYMENT) {
        console.log('Updating budget spent amount:', body.budgetId, 'Amount:', Math.abs(body.amount));
        await Budget.findByIdAndUpdate(
          body.budgetId,
          { $inc: { spent: Math.abs(body.amount) } }
        );
      }
    }

    // Update account balance based on transaction type and account type
    let balanceChange = 0;
    console.log('Transaction type:', body.type, 'Amount:', body.amount, 'Account type:', account.type);
    
    // Check if this is a liability account (credit card, loan, mortgage)
    const isLiabilityAccount = ['credit_card', 'loan', 'mortgage'].includes(account.type);
    console.log('Is liability account:', isLiabilityAccount);
    
    // Handle transaction types
    if (body.type === TransactionType.INCOME) {
      // Income always increases asset accounts and decreases liability accounts
      balanceChange = isLiabilityAccount ? -Math.abs(body.amount) : Math.abs(body.amount);
    } else if (body.type === TransactionType.EXPENSE) {
      // For expenses, we store positive amounts
      // Expenses decrease asset accounts but increase liability accounts
      balanceChange = isLiabilityAccount ? Math.abs(body.amount) : -Math.abs(body.amount);
    } else if (body.type === TransactionType.PAYMENT) {
      // For payments, decrease the source account balance
      balanceChange = -Math.abs(body.amount);
      
      // Also decrease the target liability account balance (paying down debt)
      await Account.findByIdAndUpdate(
        body.targetAccountId,
        { $inc: { balance: -Math.abs(body.amount) } }
      );
      
      console.log(`Payment of $${Math.abs(body.amount)} applied to liability account ${body.targetAccountId}`);
    }

    if (balanceChange !== 0) {
      await Account.findByIdAndUpdate(
        body.accountId,
        { $inc: { balance: balanceChange } }
      );
    }

    // Create new transaction with user ID
    const transaction = await Transaction.create({
      ...body,
      userId: session.user.id,
    });

    // Map MongoDB _id to id for frontend compatibility
    const transactionObj = transaction.toObject();
    transactionObj.id = transactionObj._id.toString();
    delete transactionObj._id;

    return NextResponse.json(transactionObj, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
