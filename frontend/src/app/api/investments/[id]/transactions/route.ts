import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getUserFromSession } from '@/utils/auth';
import mongoose from 'mongoose';
import { TransactionType } from '@/types/investment';

// POST add transaction to investment account
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid investment account ID' }, { status: 400 });
    }
    
    // Parse request body
    let transactionData;
    try {
      transactionData = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    // Validate transaction data
    if (!transactionData.type || !Object.values(TransactionType).includes(transactionData.type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }
    
    if (typeof transactionData.amount !== 'number' || isNaN(transactionData.amount)) {
      return NextResponse.json({ error: 'Transaction amount must be a number' }, { status: 400 });
    }
    
    // Find the account
    const account = await InvestmentAccount.findOne({
      _id: params.id,
      userId: user.id
    });
    
    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }
    
    // Add transaction to account
    account.transactions.push({
      ...transactionData,
      date: transactionData.date ? new Date(transactionData.date) : new Date()
    });
    
    // Save the updated account
    await account.save();
    
    // Convert to plain object and map _id to id
    const plainAccount = account.toObject({ virtuals: true });
    plainAccount.id = plainAccount._id.toString();
    delete plainAccount._id;
    delete plainAccount.__v;
    
    // Calculate and set totalShares for each stock
    if (plainAccount.stocks && plainAccount.stocks.length > 0) {
      plainAccount.stocks = plainAccount.stocks.map((stock: any) => {
        stock.totalShares = stock.lots.reduce((sum: number, lot: any) => sum + lot.shares, 0);
        return stock;
      });
    }
    
    return NextResponse.json(plainAccount);
  } catch (error: any) {
    console.error('Error adding transaction to investment account:', error);
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}

// GET transactions for investment account
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid investment account ID' }, { status: 400 });
    }
    
    // Find account by ID and user ID
    const account = await InvestmentAccount.findOne({
      _id: params.id,
      userId: user.id
    });
    
    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }
    
    // Extract and format transactions
    const transactions = account.transactions.map((transaction: any) => {
      const plainTransaction = transaction.toObject ? transaction.toObject() : transaction;
      if (plainTransaction._id) {
        plainTransaction.id = plainTransaction._id.toString();
        delete plainTransaction._id;
      }
      return plainTransaction;
    });
    
    // Sort by date descending
    transactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching investment account transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
