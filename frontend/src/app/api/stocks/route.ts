import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Common stock symbols and their company names for enhanced search
const COMMON_STOCKS: Record<string, string[]> = {
  // Tech companies
  'AAPL': ['apple', 'apple inc'],
  'MSFT': ['microsoft', 'microsoft corporation'],
  'GOOGL': ['google', 'alphabet', 'alphabet inc', 'google inc'],
  'AMZN': ['amazon', 'amazon.com', 'amazon inc'],
  'META': ['meta', 'facebook', 'meta platforms', 'fb'],
  'NVDA': ['nvidia', 'nvidia corporation'],
  'TSLA': ['tesla', 'tesla inc', 'tesla motors'],
  'NFLX': ['netflix', 'netflix inc'],
  'INTC': ['intel', 'intel corp', 'intel corporation'],
  'AMD': ['amd', 'advanced micro devices'],
  
  // Financial companies
  'JPM': ['jpmorgan', 'jp morgan', 'jpmorgan chase'],
  'BAC': ['bank of america', 'bofa'],
  'WFC': ['wells fargo'],
  'GS': ['goldman', 'goldman sachs'],
  'V': ['visa'],
  'MA': ['mastercard'],
  
  // Other major companies
  'WMT': ['walmart', 'wal-mart'],
  'DIS': ['disney', 'walt disney'],
  'KO': ['coca cola', 'coca-cola', 'coke'],
  'PEP': ['pepsi', 'pepsico'],
  'MCD': ['mcdonald', 'mcdonalds', 'mcdonald\'s'],
  'NKE': ['nike'],
  'SBUX': ['starbucks'],
};

/**
 * Find ticker symbol from company name
 */
function findTickerFromName(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct match if it's already a ticker
  if (COMMON_STOCKS[query.toUpperCase()]) {
    return query.toUpperCase();
  }
  
  // Search by company name
  for (const [ticker, names] of Object.entries(COMMON_STOCKS)) {
    if (names.some(name => name.includes(normalizedQuery) || normalizedQuery.includes(name))) {
      return ticker;
    }
  }
  
  // If no match found, return the original query (might be a valid ticker)
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('symbol');

  if (!query) {
    return NextResponse.json(
      { error: 'Stock symbol or name is required' },
      { status: 400 }
    );
  }

  try {
    // First try to find ticker from company name
    const ticker = findTickerFromName(query) || query;
    
    // Then fetch quote using the ticker
    const quote = await yahooFinance.quote(ticker.toUpperCase());
    
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
