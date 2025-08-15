import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getUserFromSession } from '@/utils/auth';

// GET all investment accounts for the user
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find all investment accounts for this user
    const accounts = await InvestmentAccount.find({ userId: user.id });
    
    // Convert MongoDB documents to plain objects and map _id to id
    const plainAccounts = accounts.map(account => {
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
      
      return plainAccount;
    });
    
    return NextResponse.json(plainAccounts);
  } catch (error: any) {
    console.error('Error fetching investment accounts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create a new investment account
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const data = await req.json();
    
    // Create new investment account with user ID
    const newAccount = new InvestmentAccount({
      ...data,
      userId: user.id
    });
    
    // Save to database
    await newAccount.save();
    
    // Convert to plain object and map _id to id
    const plainAccount = newAccount.toObject({ virtuals: true });
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
    
    return NextResponse.json(plainAccount, { status: 201 });
  } catch (error: any) {
    console.error('Error creating investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
