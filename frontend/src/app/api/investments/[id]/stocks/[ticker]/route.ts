import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getUserFromSession } from '@/utils/auth';
import mongoose from 'mongoose';
import { TransactionType } from '@/types/investment';

// PUT update a stock in investment account
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; ticker: string } }
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
    
    // Get request body
    const stockData = await req.json();
    
    // Find account by ID and user ID
    const account = await InvestmentAccount.findOne({
      _id: params.id,
      userId: user.id
    });
    
    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }
    
    // Find stock in portfolio
    const stockIndex = account.stocks.findIndex(
      (stock: any) => stock.ticker === params.ticker
    );
    
    if (stockIndex === -1) {
      return NextResponse.json({ error: 'Stock not found in portfolio' }, { status: 404 });
    }
    
    // Update stock data
    Object.keys(stockData).forEach(key => {
      if (key !== 'ticker') { // Don't allow changing the ticker
        account.stocks[stockIndex][key] = stockData[key];
      }
    });
    
    account.stocks[stockIndex].lastUpdated = new Date();
    
    // Save updated account
    await account.save();
    
    // Convert to plain object and map _id to id
    const plainAccount = account.toObject();
    plainAccount.id = plainAccount._id.toString();
    delete plainAccount._id;
    delete plainAccount.__v;
    
    return NextResponse.json(plainAccount);
  } catch (error: any) {
    console.error('Error updating stock in investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE remove a stock from investment account
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; ticker: string } }
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
    
    // Find stock in portfolio
    const stockIndex = account.stocks.findIndex(
      (stock: any) => stock.ticker === params.ticker
    );
    
    if (stockIndex === -1) {
      return NextResponse.json({ error: 'Stock not found in portfolio' }, { status: 404 });
    }
    
    // Get stock details before removal for transaction record
    const stockToRemove = account.stocks[stockIndex];
    
    // Remove stock from portfolio
    account.stocks.splice(stockIndex, 1);
    
    // Add transaction record for the removal
    account.transactions.push({
      ticker: params.ticker,
      companyName: stockToRemove.companyName,
      type: TransactionType.SELL, // Using SELL type for compatibility
      shares: stockToRemove.shares,
      price: stockToRemove.currentPrice,
      amount: stockToRemove.shares * stockToRemove.currentPrice,
      date: new Date(),
      notes: 'REMOVED_NOT_SOLD', // Special note to identify removals
    });
    
    // Save updated account
    await account.save();
    
    // Convert to plain object and map _id to id
    const plainAccount = account.toObject();
    plainAccount.id = plainAccount._id.toString();
    delete plainAccount._id;
    delete plainAccount.__v;
    
    return NextResponse.json(plainAccount);
  } catch (error: any) {
    console.error('Error removing stock from investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
