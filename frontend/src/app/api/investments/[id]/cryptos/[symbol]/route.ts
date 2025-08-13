import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import InvestmentAccount from '@/models/InvestmentAccount';
import dbConnect from '@/lib/mongoose';
import { getCryptoPrice } from '@/services/investmentService';

// GET /api/investments/[id]/cryptos/[symbol] - Get a specific crypto from an investment account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; symbol: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id, symbol } = params;

    // Find the investment account
    const account = await InvestmentAccount.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }

    // Find the crypto
    const crypto = account.cryptos?.find((c: any) => c.symbol === symbol);

    if (!crypto) {
      return NextResponse.json({ error: 'Crypto not found' }, { status: 404 });
    }

    return NextResponse.json(crypto);
  } catch (error: any) {
    console.error('Error getting crypto:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get crypto' },
      { status: 500 }
    );
  }
}

// PUT /api/investments/[id]/cryptos/[symbol] - Update a crypto in an investment account
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; symbol: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id, symbol } = params;
    const updateData = await request.json();

    // Find the investment account
    const account = await InvestmentAccount.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }

    // Find the crypto
    const cryptoIndex = account.cryptos?.findIndex(c => c.symbol === symbol);

    if (cryptoIndex === undefined || cryptoIndex < 0) {
      return NextResponse.json({ error: 'Crypto not found' }, { status: 404 });
    }

    // Update the crypto
    Object.assign(account.cryptos[cryptoIndex], updateData);
    account.cryptos[cryptoIndex].lastUpdated = new Date();

    // Save the updated account
    await account.save();

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error updating crypto:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update crypto' },
      { status: 500 }
    );
  }
}

// DELETE /api/investments/[id]/cryptos/[symbol] - Remove a crypto from an investment account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; symbol: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id, symbol } = params;

    // Find the investment account
    const account = await InvestmentAccount.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }

    // Find the crypto
    const cryptoIndex = account.cryptos?.findIndex(c => c.symbol === symbol);

    if (cryptoIndex === undefined || cryptoIndex < 0) {
      return NextResponse.json({ error: 'Crypto not found' }, { status: 404 });
    }

    // Remove the crypto
    account.cryptos.splice(cryptoIndex, 1);

    // Add transaction record for removal
    account.transactions.push({
      type: 'Remove',
      ticker: symbol,
      amount: 0, // No amount for removal
      date: new Date(),
      notes: `Removed ${symbol} from portfolio`,
    });

    // Save the updated account
    await account.save();

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error removing crypto:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove crypto' },
      { status: 500 }
    );
  }
}
