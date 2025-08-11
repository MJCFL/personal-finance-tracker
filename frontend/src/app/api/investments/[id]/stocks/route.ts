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
      // Stock exists, add the new lots to the existing stock
      const existingStock = account.stocks[existingStockIndex];
      
      // Add the new lots to the existing stock's lots array
      if (stockData.lots && stockData.lots.length > 0) {
        existingStock.lots.push(...stockData.lots);
      }
      
      // Update the current price and last updated timestamp
      existingStock.currentPrice = stockData.currentPrice;
      existingStock.lastUpdated = new Date();
    } else {
      // Add new stock to portfolio
      account.stocks.push({
        ...stockData,
        lastUpdated: new Date()
      });
    }
    
    // Add transaction record
    // Calculate total shares from lots
    const totalShares = stockData.lots.reduce((sum: number, lot: any) => sum + lot.shares, 0);
    // Calculate total cost basis from lots
    const totalCostBasis = stockData.lots.reduce((sum: number, lot: any) => sum + (lot.shares * lot.purchasePrice), 0);
    
    // Get the purchase date from the first lot (assuming all lots have the same purchase date for a single transaction)
    const purchaseDate = stockData.lots && stockData.lots.length > 0 ? 
      new Date(stockData.lots[0].purchaseDate) : new Date();
    
    // Calculate average purchase price from lots
    const avgPurchasePrice = totalShares > 0 ? totalCostBasis / totalShares : 0;
      
    account.transactions.push({
      ticker: stockData.ticker,
      companyName: stockData.companyName,
      type: 'Buy', // Use proper enum value from TransactionType.BUY
      shares: totalShares,
      price: avgPurchasePrice, // Use average purchase price from lots instead of current price
      amount: totalCostBasis, // Use calculated cost basis for amount
      date: purchaseDate,
    });
    
    // Save updated account
    await account.save();
    
    // Convert to plain object and map _id to id
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
    console.error('Error adding stock to investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
