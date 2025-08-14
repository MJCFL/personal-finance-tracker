import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import Budget from '@/models/Budget';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TransactionType } from '@/types/commonTypes';

// Helper function to get transaction and verify ownership
async function getTransactionAndVerifyOwnership(id: string, userId: string) {
  const transaction = await Transaction.findById(id);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  if (transaction.userId !== userId) {
    throw new Error('Unauthorized: You do not have access to this transaction');
  }
  
  return transaction;
}

// GET handler to fetch a specific transaction by ID
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

    // Get transaction and verify ownership
    const transaction = await getTransactionAndVerifyOwnership(params.id, session.user.id);

    // Populate account and budget information
    const populatedTransaction = await Transaction.findById(params.id)
      .populate('accountId', 'name type')
      .populate('budgetId', 'name category');

    return NextResponse.json(populatedTransaction);
  } catch (error: any) {
    console.error(`Error fetching transaction ${params.id}:`, error);
    
    if (error.message === 'Transaction not found') {
      return NextResponse.json(
        { error: 'Transaction not found' },
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
      { error: error.message || 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT handler to update a specific transaction
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

    // Get the original transaction and verify ownership
    const originalTransaction = await getTransactionAndVerifyOwnership(params.id, session.user.id);
    
    // Parse request body
    const body = await req.json();

    // If account is being changed, verify new account ownership
    if (body.accountId && body.accountId !== originalTransaction.accountId.toString()) {
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
    }

    // If budget is being changed, verify new budget ownership
    if (body.budgetId && body.budgetId !== (originalTransaction.budgetId?.toString() || null)) {
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
    }

    // Handle account balance adjustments
    if (body.amount !== originalTransaction.amount || 
        body.type !== originalTransaction.type || 
        body.accountId !== originalTransaction.accountId.toString()) {
      
      // Revert original transaction's effect on account balance
      let originalBalanceChange = 0;
      if (originalTransaction.type === TransactionType.INCOME) {
        originalBalanceChange = -originalTransaction.amount;
      } else if (originalTransaction.type === TransactionType.EXPENSE) {
        originalBalanceChange = originalTransaction.amount;
      }

      if (originalBalanceChange !== 0) {
        await Account.findByIdAndUpdate(
          originalTransaction.accountId,
          { $inc: { balance: originalBalanceChange } }
        );
      }

      // Apply new transaction's effect on account balance
      let newBalanceChange = 0;
      if (body.type === TransactionType.INCOME) {
        newBalanceChange = body.amount;
      } else if (body.type === TransactionType.EXPENSE) {
        newBalanceChange = -body.amount;
      }

      if (newBalanceChange !== 0) {
        await Account.findByIdAndUpdate(
          body.accountId || originalTransaction.accountId,
          { $inc: { balance: newBalanceChange } }
        );
      }
    }

    // Handle budget spent amount adjustments
    if (originalTransaction.type === TransactionType.EXPENSE && originalTransaction.budgetId) {
      // Revert original transaction's effect on budget spent amount
      console.log(`Reverting budget spent for transaction ${originalTransaction.id}: -${originalTransaction.amount}`);
      await Budget.findByIdAndUpdate(
        originalTransaction.budgetId,
        { $inc: { spent: -Math.abs(originalTransaction.amount) } }
      );
    }

    if (body.type === TransactionType.EXPENSE && body.budgetId) {
      // Apply new transaction's effect on budget spent amount
      console.log(`Updating budget spent for transaction ${originalTransaction.id}: +${body.amount}`);
      await Budget.findByIdAndUpdate(
        body.budgetId,
        { $inc: { spent: Math.abs(body.amount) } }
      );
    }

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedTransaction);
  } catch (error: any) {
    console.error(`Error updating transaction ${params.id}:`, error);
    
    if (error.message === 'Transaction not found') {
      return NextResponse.json(
        { error: 'Transaction not found' },
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
      { error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a specific transaction
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

    // Get transaction and verify ownership
    const transaction = await getTransactionAndVerifyOwnership(params.id, session.user.id);

    // Revert transaction's effect on account balance
    let balanceChange = 0;
    if (transaction.type === TransactionType.INCOME) {
      balanceChange = -transaction.amount;
    } else if (transaction.type === TransactionType.EXPENSE) {
      balanceChange = transaction.amount;
    }

    if (balanceChange !== 0) {
      await Account.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: balanceChange } }
      );
    }

    // Revert transaction's effect on budget spent amount if applicable
    if (transaction.type === TransactionType.EXPENSE && transaction.budgetId) {
      console.log(`Reverting budget spent for deleted transaction ${transaction.id}: -${transaction.amount}`);
      await Budget.findByIdAndUpdate(
        transaction.budgetId,
        { $inc: { spent: -Math.abs(transaction.amount) } }
      );
    }

    // Delete transaction
    await Transaction.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Transaction deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting transaction ${params.id}:`, error);
    
    if (error.message === 'Transaction not found') {
      return NextResponse.json(
        { error: 'Transaction not found' },
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
      { error: error.message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
