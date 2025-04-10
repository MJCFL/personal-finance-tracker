import yahooFinance from 'yahoo-finance2';

export interface StockQuote {
  symbol: string;
  price: number;
  name: string;
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    // Clean up the symbol (remove spaces, convert to uppercase)
    const cleanSymbol = symbol.trim().toUpperCase();
    
    // Call our API route instead of Yahoo Finance directly
    const response = await fetch(`/api/stocks?symbol=${encodeURIComponent(cleanSymbol)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stock data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw new Error('Unable to fetch stock data');
  }
}
