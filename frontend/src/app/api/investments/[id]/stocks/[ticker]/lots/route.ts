import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';

// POST /api/investments/[id]/stocks/[ticker]/lots - Add a new lot to a stock
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; ticker: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ticker } = params;
    const { shares, purchasePrice, purchaseDate, notes } = await request.json();

    // Validate required fields
    if (!shares || !purchasePrice || !purchaseDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the investment account and ensure it belongs to the user
    const account = await InvestmentAccount.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Investment account not found' },
        { status: 404 }
      );
    }

    // Find the stock in the account
    const stockIndex = account.stocks.findIndex(
      (stock: any) => stock.ticker.toUpperCase() === ticker.toUpperCase()
    );

    if (stockIndex === -1) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    // Create a new lot with a unique ID
    const newLot = {
      id: uuidv4(),
      ticker: ticker.toUpperCase(),
      shares,
      purchasePrice,
      purchaseDate: new Date(purchaseDate),
      notes,
    };

    // Add the lot to the stock
    account.stocks[stockIndex].lots.push(newLot);
    
    // Add transaction record for the new lot
    account.transactions.push({
      ticker: ticker.toUpperCase(),
      companyName: account.stocks[stockIndex].companyName,
      type: 'Buy',
      shares: shares,
      price: purchasePrice,
      amount: shares * purchasePrice,
      date: new Date(purchaseDate),
    });

    // Save the updated account
    await account.save();
    
    // Convert to plain object and ensure virtuals are included
    const plainAccount = account.toObject({ virtuals: true });
    plainAccount.id = plainAccount._id.toString();
    delete plainAccount._id;
    delete plainAccount.__v;
    
    // Calculate and set totalShares for each stock
    plainAccount.stocks = plainAccount.stocks.map((stock: any) => {
      stock.totalShares = stock.lots.reduce((sum: number, lot: any) => sum + lot.shares, 0);
      return stock;
    });
    
    return NextResponse.json(plainAccount);
  } catch (error: any) {
    console.error('Error adding stock lot:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add stock lot' },
      { status: 500 }
    );
  }
}

// GET /api/investments/[id]/stocks/[ticker]/lots - Get all lots for a stock
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; ticker: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ticker } = params;

    await dbConnect();

    // Find the investment account and ensure it belongs to the user
    const account = await InvestmentAccount.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Investment account not found' },
        { status: 404 }
      );
    }

    // Find the stock in the account
    const stock = account.stocks.find(
      (stock: any) => stock.ticker.toUpperCase() === ticker.toUpperCase()
    );

    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    // Calculate total shares from lots
    const totalShares = stock.lots.reduce((sum: number, lot: any) => sum + lot.shares, 0);
    
    // Return lots with totalShares information
    return NextResponse.json({
      lots: stock.lots,
      totalShares: totalShares,
      ticker: stock.ticker,
      companyName: stock.companyName
    });
  } catch (error: any) {
    console.error('Error getting stock lots:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get stock lots' },
      { status: 500 }
    );
  }
}
