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
    const { amount, price, date, notes } = await request.json();

    if (!amount || amount <= 0 || !price || price <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount or price' },
        { status: 400 }
      );
    }

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
    
    // Calculate total amount owned
    const totalAmount = crypto.lots.reduce((sum: number, lot: any) => sum + lot.amount, 0);
    
    if (amount > totalAmount) {
      return NextResponse.json(
        { error: `Cannot sell more than owned (${totalAmount})` },
        { status: 400 }
      );
    }

    // Create a sell transaction
    const transaction = {
      type: TransactionType.SELL,
      symbol: symbol.toUpperCase(),
      name: crypto.name,
      amount: amount,
      price: price,
      date: new Date(date),
      notes: notes || '',
      total: amount * price,
    };

    // Add transaction to account
    await db.collection('investmentAccounts').updateOne(
      { _id: new ObjectId(id) },
      { $push: { transactions: transaction } as any }
    );

    // Reduce crypto amount using FIFO (First In, First Out) method
    let remainingAmountToSell = amount;
    const updatedLots = [...crypto.lots];
    
    // Sort lots by purchase date (oldest first)
    updatedLots.sort((a: any, b: any) => 
      new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    );

    for (let i = 0; i < updatedLots.length; i++) {
      if (remainingAmountToSell <= 0) break;
      
      const lot = updatedLots[i];
      
      if (lot.amount <= remainingAmountToSell) {
        // Sell entire lot
        remainingAmountToSell -= lot.amount;
        updatedLots[i] = { ...lot, amount: 0 };
      } else {
        // Sell partial lot
        updatedLots[i] = { ...lot, amount: lot.amount - remainingAmountToSell };
        remainingAmountToSell = 0;
      }
    }

    // Remove empty lots
    const filteredLots = updatedLots.filter((lot: any) => lot.amount > 0);
    
    // Update crypto with new lots
    account.cryptos[cryptoIndex].lots = filteredLots;
    
    // If all lots are sold, remove the crypto if it has no lots left
    if (filteredLots.length === 0) {
      account.cryptos.splice(cryptoIndex, 1);
    }

    // Update the account
    await db.collection('investmentAccounts').updateOne(
      { _id: new ObjectId(id) },
      { $set: { cryptos: account.cryptos } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error selling crypto:', error);
    return NextResponse.json(
      { error: 'Failed to sell crypto' },
      { status: 500 }
    );
  }
}
