import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Account from '@/models/Account';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

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
    console.log('API: Received update request for account ID:', params.id);
    
    // Connect to the database
    await dbConnect();
    console.log('API: Connected to database');

    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('API: Unauthorized - No valid session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('API: User authenticated:', session.user.id);

    // Get account and verify ownership
    await getAccountAndVerifyOwnership(params.id, session.user.id);
    console.log('API: Account ownership verified');

    // Parse request body
    const body = await req.json();
    console.log('API: Request body received:', body);

    // Ensure interest rate is properly processed as a number for ALL accounts
    if (body.interestRate !== undefined) {
      const interestRateValue = Number(body.interestRate);
      body.interestRate = isNaN(interestRateValue) ? 0 : interestRateValue;
      console.log('API: Processed interest rate as number:', body.interestRate, 'type:', typeof body.interestRate);
    }
    
    // Log the request body for debugging
    console.log('API: PUT /api/accounts/[id] request body:', body);
    
    // CRITICAL FIX: Always ensure interest rate is explicitly set for liability accounts
    if (body.type === 'credit_card' || body.type === 'loan' || body.type === 'mortgage') {
      // Force interest rate to be a number, even if it's 0
      // This is critical for the MongoDB update to recognize it as a change
      body.interestRate = body.interestRate !== undefined ? body.interestRate : 0;
      
      console.log('API: Ensuring interest rate is explicitly set for liability account:', 
                 body.interestRate, 'type:', typeof body.interestRate);
    }
    
    // For liability accounts, ensure interest rate is explicitly set in the update
    let updatedAccount;
    
    if (body.type === 'credit_card' || body.type === 'loan' || body.type === 'mortgage') {
      try {
        // Create a specific update object for liability accounts
        const updateData = {
          ...body,
          // CRITICAL FIX: Always explicitly set interest rate for liability accounts
          // and ensure it's a number (not undefined, null, or NaN)
          interestRate: body.interestRate !== undefined ? body.interestRate : 0,
          updatedAt: new Date()
        };
        
        console.log('API: Using explicit update for liability account with interest rate:', 
                    updateData.interestRate, 'type:', typeof updateData.interestRate);
        
        // Use findByIdAndUpdate with the explicit update object
        updatedAccount = await Account.findByIdAndUpdate(
          params.id,
          updateData,
          { new: true, runValidators: true }
        );
        
        console.log('API: Account updated with explicit interest rate:', 
                    updatedAccount.interestRate, 'type:', typeof updatedAccount.interestRate);
      } catch (error) {
        console.error('API: Error updating liability account:', error);
        throw error;
      }
    } else {
      // For non-liability accounts, use the standard update approach
      updatedAccount = await Account.findByIdAndUpdate(
        params.id,
        { ...body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
    }
    console.log('API: Account updated successfully:', updatedAccount);

    return NextResponse.json(updatedAccount);
  } catch (error: any) {
    console.error(`API: Error updating account ${params.id}:`, error);
    console.error('API: Error stack:', error.stack);
    
    if (error.message === 'Account not found') {
      console.error('API: Account not found error');
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Unauthorized')) {
      console.error('API: Unauthorized error');
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    console.error('API: General server error');
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
