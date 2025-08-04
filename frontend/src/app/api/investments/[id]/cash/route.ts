import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import InvestmentAccount from '@/models/InvestmentAccount';
import { getUserFromSession } from '@/utils/auth';

// PUT update cash balance for an investment account
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
    
    const { id } = params;
    const { cash } = await req.json();
    
    // Validate cash amount
    if (typeof cash !== 'number' || cash < 0) {
      return NextResponse.json(
        { error: 'Cash amount must be a non-negative number' },
        { status: 400 }
      );
    }
    
    // Find and update the investment account
    const account = await InvestmentAccount.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: { cash } },
      { new: true }
    );
    
    if (!account) {
      return NextResponse.json(
        { error: 'Investment account not found' },
        { status: 404 }
      );
    }
    
    // Convert to plain object and map _id to id
    const plainAccount = account.toObject();
    plainAccount.id = plainAccount._id.toString();
    delete plainAccount._id;
    delete plainAccount.__v;
    
    return NextResponse.json(plainAccount);
  } catch (error: any) {
    console.error('Error updating cash balance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
