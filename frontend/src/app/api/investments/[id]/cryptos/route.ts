import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';
import InvestmentAccount from '@/models/InvestmentAccount';
import dbConnect from '@/lib/mongoose';
import { ICrypto } from '@/types/investment';

// POST /api/investments/[id]/cryptos - Add a new crypto to an investment account
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const accountId = params.id;
    const { symbol, name, lot } = await request.json();

    // Find the investment account
    const account = await InvestmentAccount.findOne({
      _id: accountId,
      userId: session.user.id,
    });

    if (!account) {
      return NextResponse.json({ error: 'Investment account not found' }, { status: 404 });
    }

    // Check if crypto already exists
    const existingCryptoIndex = account.cryptos?.findIndex(
      (crypto: ICrypto) => crypto.symbol === symbol
    );

    if (existingCryptoIndex !== undefined && existingCryptoIndex >= 0) {
      // Add lot to existing crypto
      account.cryptos[existingCryptoIndex].lots.push(lot);
    } else {
      // Get current price from API
      let currentPrice = lot.purchasePrice; // Default to purchase price
      try {
        // Try to get the real price from our price API
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cryptos/price?symbol=${symbol}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          currentPrice = data.price;
          console.log(`Got real price for ${symbol}: ${currentPrice}`);
        }
      } catch (priceError) {
        console.error(`Error getting real price for ${symbol}, using purchase price:`, priceError);
        // Fall back to purchase price if API fails
      }
      
      // Create new crypto with initial lot and current price
      const newCrypto = {
        symbol,
        name,
        lots: [lot],
        currentPrice: currentPrice, // Use fetched price or purchase price as fallback
        lastUpdated: new Date(),
      };

      // Initialize cryptos array if it doesn't exist
      if (!account.cryptos) {
        account.cryptos = [];
      }

      account.cryptos.push(newCrypto);
    }

    // Add transaction record
    account.transactions.push({
      type: 'Buy',
      ticker: symbol,
      companyName: name,
      shares: lot.amount,
      price: lot.purchasePrice,
      amount: lot.amount * lot.purchasePrice,
      date: lot.purchaseDate,
      notes: lot.notes,
    });

    // Save the updated account
    await account.save();

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error adding crypto:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add crypto' },
      { status: 500 }
    );
  }
}
