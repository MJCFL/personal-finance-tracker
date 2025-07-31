import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Budget from '@/models/Budget';
import dbConnect from '@/lib/mongoose';
import { getUserFromSession } from '@/utils/auth';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/budgets/[id] - Get a specific budget
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session and verify authentication - FIXED: properly await the async function
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate the budget ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid budget ID' },
        { status: 400 }
      );
    }

    // Get the budget by ID and user ID
    const budget = await Budget.findOne({ _id: id, userId: user.id });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json(formattedBudget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

// PUT /api/budgets/[id] - Update a specific budget
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session and verify authentication - FIXED: properly await the async function
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate the budget ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid budget ID' },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Get the budget by ID and user ID
    const budget = await Budget.findOne({ _id: id, userId: user.id });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Update the budget
    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { ...body, userId: user.id }, // Ensure userId remains the same
      { new: true, runValidators: true }
    );

    if (!updatedBudget) {
      return NextResponse.json(
        { error: 'Failed to update budget' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedBudget = {
      id: updatedBudget._id.toString(),
      userId: updatedBudget.userId,
      name: updatedBudget.name,
      category: updatedBudget.category,
      amount: updatedBudget.amount,
      spent: updatedBudget.spent,
      period: updatedBudget.period,
      startDate: updatedBudget.startDate.toISOString(),
      endDate: updatedBudget.endDate ? updatedBudget.endDate.toISOString() : undefined,
      isRecurring: updatedBudget.isRecurring,
      createdAt: updatedBudget.createdAt.toISOString(),
      updatedAt: updatedBudget.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedBudget);
  } catch (error: any) {
    console.error('Error updating budget:', error);
    
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
      { error: error.message || 'Failed to update budget' },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id] - Delete a specific budget
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session and verify authentication - FIXED: properly await the async function
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate the budget ID
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid budget ID' },
        { status: 400 }
      );
    }

    // Get the budget by ID and user ID
    const budget = await Budget.findOne({ _id: id, userId: user.id });

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Delete the budget
    await Budget.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Budget deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
