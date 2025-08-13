import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { TransactionType } from '@/types/investment';

export async function POST(
  request: Request,
  { params }: { params: { id: string; symbol: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, symbol } = params;
    const { reason } = await request.json();

    const client = await clientPromise;
    const db = client.db();
    
    // Get the investment account
    const account = await db.collection('investmentAccounts').findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Investment account not found' },
        { status: 404 }
      );
    }

    // Find the crypto in the account
    const cryptoIndex = account.cryptos.findIndex(
      (c: any) => c.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (cryptoIndex === -1) {
      return NextResponse.json(
        { error: 'Crypto not found in account' },
        { status: 404 }
      );
    }

    const crypto = account.cryptos[cryptoIndex];
    
    // Create a remove transaction
    const transaction = {
      type: TransactionType.REMOVE,
      symbol: symbol.toUpperCase(),
      name: crypto.name,
      date: new Date(),
      notes: reason || 'Removed from portfolio',
      amount: 0, // Required field but not relevant for REMOVE
      price: 0,  // Required field but not relevant for REMOVE
    };

    // Add transaction to account
    await db.collection('investmentAccounts').updateOne(
      { _id: new ObjectId(id) },
      { $push: { transactions: transaction } as any }
    );

    // Remove the crypto from the account
    account.cryptos.splice(cryptoIndex, 1);

    // Update the account
    await db.collection('investmentAccounts').updateOne(
      { _id: new ObjectId(id) },
      { $set: { cryptos: account.cryptos } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing crypto:', error);
    return NextResponse.json(
      { error: 'Failed to remove crypto' },
      { status: 500 }
    );
  }
}
