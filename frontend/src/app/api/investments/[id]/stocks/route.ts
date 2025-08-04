import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getUserFromSession } from '@/utils/auth';
import mongoose from 'mongoose';

// POST add a new stock to investment account
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
    const stockData = await req.json();
    
    // Find account by ID and user ID
    const account = await InvestmentAccount.findOne({
      _id: params.id,
      userId: user.id
    });
    
    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }
    
    // Check if stock already exists in portfolio
    const existingStockIndex = account.stocks.findIndex(
      (stock: any) => stock.ticker === stockData.ticker
    );
    
    if (existingStockIndex !== -1) {
      // Stock exists, calculate new average buy price
      const existingStock = account.stocks[existingStockIndex];
      const totalShares = existingStock.shares + stockData.shares;
      const totalCost = (existingStock.shares * existingStock.avgBuyPrice) + 
                       (stockData.shares * stockData.avgBuyPrice);
      const newAvgPrice = totalCost / totalShares;
      
      // Update existing stock
      account.stocks[existingStockIndex].shares = totalShares;
      account.stocks[existingStockIndex].avgBuyPrice = newAvgPrice;
      account.stocks[existingStockIndex].currentPrice = stockData.currentPrice;
      account.stocks[existingStockIndex].lastUpdated = new Date();
    } else {
      // Add new stock to portfolio
      account.stocks.push({
        ...stockData,
        lastUpdated: new Date()
      });
    }
    
    // Add transaction record
    account.transactions.push({
      ticker: stockData.ticker,
      companyName: stockData.companyName,
      type: 'buy', // Changed from transactionType to type to match schema
      shares: stockData.shares,
      price: stockData.avgBuyPrice, // Changed from pricePerShare to price to match schema
      amount: stockData.shares * stockData.avgBuyPrice, // Changed from totalAmount to amount to match schema
      date: new Date(),
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
    console.error('Error adding stock to investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
