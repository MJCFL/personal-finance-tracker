import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import Budget from '@/models/Budget';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    return NextResponse.json({
      transactions,
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

      // Update budget spent amount if it's an expense
      if (body.type === 'expense') {
        await Budget.findByIdAndUpdate(
          body.budgetId,
          { $inc: { spent: body.amount } }
        );
      }
    }

    // Update account balance based on transaction type
    let balanceChange = 0;
    if (body.type === 'income') {
      balanceChange = body.amount;
    } else if (body.type === 'expense') {
      balanceChange = -body.amount;
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

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
