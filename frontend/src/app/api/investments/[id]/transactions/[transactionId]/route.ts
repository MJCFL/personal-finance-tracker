import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getUserFromSession } from '@/utils/auth';
import mongoose from 'mongoose';

// DELETE transaction without affecting balance
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; transactionId: string } }
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
    
    if (!params.transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }
    
    // Find the account
    const account = await InvestmentAccount.findOne({
      _id: params.id,
      userId: user.id
    });
    
    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }
    
    // Find the transaction
    const transactionIndex = account.transactions.findIndex(
      (t: any) => t._id.toString() === params.transactionId
    );
    
    if (transactionIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Remove the transaction without affecting balance
    account.transactions.splice(transactionIndex, 1);
    
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
    
    return NextResponse.json({
      message: 'Transaction deleted successfully',
      account: plainAccount
    });
  } catch (error: any) {
    console.error('Error deleting transaction from investment account:', error);
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}
