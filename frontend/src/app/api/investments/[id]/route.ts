import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getUserFromSession } from '@/utils/auth';
import mongoose from 'mongoose';

// GET investment account by ID
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
    console.error('Error fetching investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update investment account
export async function PUT(
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
    const data = await req.json();
    
    // Find and update account
    const updatedAccount = await InvestmentAccount.findOneAndUpdate(
      { _id: params.id, userId: user.id },
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!updatedAccount) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }
    
    // Convert to plain object and map _id to id
    const plainAccount = updatedAccount.toObject({ virtuals: true });
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
    console.error('Error updating investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE investment account
export async function DELETE(
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
    
    // Find and delete account
    const deletedAccount = await InvestmentAccount.findOneAndDelete({
      _id: params.id,
      userId: user.id
    });
    
    if (!deletedAccount) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting investment account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
