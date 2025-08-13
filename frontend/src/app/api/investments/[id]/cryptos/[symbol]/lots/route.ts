import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import InvestmentAccount from '@/models/InvestmentAccount';
import dbConnect from '@/lib/mongoose';

// POST /api/investments/[id]/cryptos/[symbol]/lots - Add a new lot to a crypto
export async function POST(
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
    const lotData = await request.json();

    // Find the investment account
    const account = await InvestmentAccount.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }

    // Find the crypto
    const cryptoIndex = account.cryptos?.findIndex((c: any) => c.symbol === symbol);

    if (cryptoIndex === undefined || cryptoIndex < 0) {
      return NextResponse.json({ error: 'Crypto not found' }, { status: 404 });
    }

    // Add the new lot
    account.cryptos[cryptoIndex].lots.push(lotData);

    // Add transaction record
    account.transactions.push({
      type: 'Buy',
      ticker: symbol,
      companyName: account.cryptos[cryptoIndex].name,
      shares: lotData.amount,
      price: lotData.purchasePrice,
      amount: lotData.amount * lotData.purchasePrice,
      date: lotData.purchaseDate,
      notes: lotData.notes,
    });

    // Save the updated account
    await account.save();

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error adding crypto lot:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add crypto lot' },
      { status: 500 }
    );
  }
}
