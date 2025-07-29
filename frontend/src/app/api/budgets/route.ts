import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Budget from '@/models/Budget';
import dbConnect from '@/lib/dbConnect';
import { getUserFromSession } from '@/utils/auth';

// GET /api/budgets - Get all budgets for the current user
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session and verify authentication
    const session = await getServerSession(authOptions);
    const user = getUserFromSession(session);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all budgets for the current user
    const budgets = await Budget.find({ userId: user.id }).sort({ createdAt: -1 });

    // Transform MongoDB documents to plain objects with string IDs
    const formattedBudgets = budgets.map(budget => ({
      id: budget._id.toString(),
      userId: budget.userId,
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent,
      period: budget.period,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate ? budget.endDate.toISOString() : undefined,
      isRecurring: budget.isRecurring,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedBudgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Create a new budget
export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session and verify authentication
    const session = await getServerSession(authOptions);
    const user = getUserFromSession(session);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Create a new budget with the user ID
    const budget = await Budget.create({
      ...body,
      userId: user.id,
      spent: 0, // Initialize spent amount to 0
    });

    // Format the response
    const formattedBudget = {
      id: budget._id.toString(),
      userId: budget.userId,
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent,
      period: budget.period,
      startDate: budget.startDate.toISOString(),
      endDate: budget.endDate ? budget.endDate.toISOString() : undefined,
      isRecurring: budget.isRecurring,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedBudget, { status: 201 });
  } catch (error: any) {
    console.error('Error creating budget:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};
      
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return NextResponse.json(
        { error: 'Validation error', validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
