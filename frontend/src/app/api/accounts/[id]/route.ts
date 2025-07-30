import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Account from '@/models/Account';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to get account and verify ownership
async function getAccountAndVerifyOwnership(id: string, userId: string) {
  const account = await Account.findById(id);
  
  if (!account) {
    throw new Error('Account not found');
  }
  
  if (account.userId !== userId) {
    throw new Error('Unauthorized: You do not have access to this account');
  }
  
  return account;
}

// GET handler to fetch a specific account by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get account and verify ownership
    const account = await getAccountAndVerifyOwnership(params.id, session.user.id);

    return NextResponse.json(account);
  } catch (error: any) {
    console.error(`Error fetching account ${params.id}:`, error);
    
    if (error.message === 'Account not found') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

// PUT handler to update a specific account
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get account and verify ownership
    await getAccountAndVerifyOwnership(params.id, session.user.id);

    // Parse request body
    const body = await req.json();

    // Update account
    const updatedAccount = await Account.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedAccount);
  } catch (error: any) {
    console.error(`Error updating account ${params.id}:`, error);
    
    if (error.message === 'Account not found') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update account' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a specific account
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get account and verify ownership
    await getAccountAndVerifyOwnership(params.id, session.user.id);

    // Delete account
    await Account.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting account ${params.id}:`, error);
    
    if (error.message === 'Account not found') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
