import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import InvestmentAccount from '@/models/InvestmentAccount';
import dbConnect from '@/lib/mongoose';

// PUT /api/investments/[id]/cryptos/[symbol]/lots/[lotId] - Update a crypto lot
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; symbol: string; lotId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id, symbol, lotId } = params;
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

    // Find the lot
    const lotIndex = account.cryptos[cryptoIndex].lots.findIndex(lot => lot.id === lotId);

    if (lotIndex < 0) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Update the lot
    Object.assign(account.cryptos[cryptoIndex].lots[lotIndex], updateData);

    // Add transaction record for update if amount or price changed
    if (updateData.amount !== undefined || updateData.purchasePrice !== undefined) {
      const oldLot = account.cryptos[cryptoIndex].lots[lotIndex];
      account.transactions.push({
        type: 'Update',
        ticker: symbol,
        companyName: account.cryptos[cryptoIndex].name,
        shares: updateData.amount || oldLot.amount,
        price: updateData.purchasePrice || oldLot.purchasePrice,
        amount: (updateData.amount || oldLot.amount) * (updateData.purchasePrice || oldLot.purchasePrice),
        date: new Date(),
        notes: `Updated ${symbol} lot`,
      });
    }

    // Save the updated account
    await account.save();

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error updating crypto lot:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update crypto lot' },
      { status: 500 }
    );
  }
}

// DELETE /api/investments/[id]/cryptos/[symbol]/lots/[lotId] - Delete a crypto lot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; symbol: string; lotId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const { id, symbol, lotId } = params;

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

    // Find the lot
    const lotIndex = account.cryptos[cryptoIndex].lots.findIndex(lot => lot.id === lotId);

    if (lotIndex < 0) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
    }

    // Get lot details before removal for transaction record
    const lot = account.cryptos[cryptoIndex].lots[lotIndex];

    // Remove the lot
    account.cryptos[cryptoIndex].lots.splice(lotIndex, 1);

    // If no lots remain, remove the crypto
    if (account.cryptos[cryptoIndex].lots.length === 0) {
      account.cryptos.splice(cryptoIndex, 1);
    }

    // Add transaction record for lot removal
    account.transactions.push({
      type: 'Sell',
      ticker: symbol,
      companyName: account.cryptos[cryptoIndex]?.name || symbol,
      shares: lot.amount,
      price: lot.purchasePrice,
      amount: lot.amount * lot.purchasePrice,
      date: new Date(),
      notes: `Removed ${symbol} lot`,
    });

    // Save the updated account
    await account.save();

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error deleting crypto lot:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete crypto lot' },
      { status: 500 }
    );
  }
}
