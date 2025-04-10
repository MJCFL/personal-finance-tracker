import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Stock symbol is required' },
      { status: 400 }
    );
  }

  try {
    const quote = await yahooFinance.quote(symbol.toUpperCase());
    
    if (!quote || !quote.regularMarketPrice) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      name: quote.longName || quote.shortName || quote.symbol,
    });
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
