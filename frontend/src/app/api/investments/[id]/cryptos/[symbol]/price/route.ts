import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import InvestmentAccount from '@/models/InvestmentAccount';
import dbConnect from '@/lib/mongoose';

// PUT /api/investments/[id]/cryptos/[symbol]/price - Update a crypto's price
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

    // Get current price from real API
    let price;
    try {
      // Try to get the price from our real price API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cryptos/price?symbol=${symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }
      
      const data = await response.json();
      price = data.price;
      console.log(`Got real price for ${symbol}: ${price}`);
    } catch (error) {
      console.error(`Error getting real price for ${symbol}:`, error);
      // Fall back to mock price if real API fails
      price = await getMockCryptoPrice(symbol);
      console.log(`Falling back to mock price for ${symbol}: ${price}`);
    }
    
    console.log(`Updating price for ${symbol} to ${price}`);

    // Update the crypto price
    account.cryptos[cryptoIndex].currentPrice = price;
    account.cryptos[cryptoIndex].lastUpdated = new Date();
    console.log(`Updated crypto price in database: ${symbol} = ${price}`);

    // Save the updated account
    await account.save();

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error updating crypto price:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update crypto price' },
      { status: 500 }
    );
  }
}

// Mock function to generate realistic crypto prices
async function getMockCryptoPrice(symbol: string): Promise<number> {
  // Common crypto prices as of 2025 (these would be fetched from an API in production)
  const basePrices: Record<string, number> = {
    'BTC': 119000,
    'ETH': 8500,
    'SOL': 450,
    'ADA': 2.5,
    'DOT': 35,
    'AVAX': 120,
    'MATIC': 5.2,
    'LINK': 60,
    'XRP': 3.2,
    'DOGE': 0.45,
    'SHIB': 0.0005,
    'UNI': 25,
    'ATOM': 42,
    'LTC': 280,
    'XLM': 0.85,
  };

  // Normalize the symbol
  const normalizedSymbol = symbol.toUpperCase();
  
  // If we have a base price for this symbol, use it with a small random variation
  if (normalizedSymbol in basePrices) {
    const basePrice = basePrices[normalizedSymbol];
    // Add a random variation of ±5%
    const variation = (Math.random() * 0.1) - 0.05;
    return basePrice * (1 + variation);
  }
  
  // For unknown symbols, generate a random price between $0.01 and $100
  return Math.random() * 100 + 0.01;
}
