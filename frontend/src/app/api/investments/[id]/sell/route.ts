import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getUserFromSession } from '@/utils/auth';
import mongoose from 'mongoose';
import { TransactionType } from '@/types/investment';

// POST sell stock from investment account
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
    
    // Get request body
    const saleData = await req.json();
    const { ticker, companyName, shares, price } = saleData;
    
    // Validate required fields
    if (!ticker || !shares || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
      (stock: any) => stock.ticker === ticker
    );
    
    if (stockIndex === -1) {
      return NextResponse.json({ error: 'Stock not found in portfolio' }, { status: 404 });
    }
    
    const stock = account.stocks[stockIndex];
    
    // Check if user has enough shares to sell
    if (stock.shares < shares) {
      return NextResponse.json({ 
        error: `Not enough shares to sell. You have ${stock.shares} shares.` 
      }, { status: 400 });
    }
    
    // Calculate sale amount
    const saleAmount = shares * price;
    
    // Update stock shares or remove if selling all
    if (stock.shares === shares) {
      // Remove stock if selling all shares
      account.stocks.splice(stockIndex, 1);
    } else {
      // Update shares if selling partial position
      account.stocks[stockIndex].shares -= shares;
      account.stocks[stockIndex].lastUpdated = new Date();
    }
    
    // Add transaction record
    account.transactions.push({
      type: TransactionType.SELL,
      ticker: ticker,
      companyName: companyName || stock.companyName,
      shares: shares,
      price: price,
      amount: saleAmount,
      date: new Date(),
    });
    
    // Update cash balance
    account.cash += saleAmount;
    
    // Save updated account
    await account.save();
    
    // Convert to plain object and map _id to id
    const plainAccount = account.toObject();
    plainAccount.id = plainAccount._id.toString();
    delete plainAccount._id;
    delete plainAccount.__v;
    
    return NextResponse.json(plainAccount);
  } catch (error: any) {
    console.error('Error selling stock from investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
