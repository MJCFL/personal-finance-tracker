import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/utils/auth';
import yahooFinance from 'yahoo-finance2';

// Interface for stock search results
interface StockSearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

// Cache for search results to avoid excessive API calls
interface CachedSearch {
  results: StockSearchResult[];
  timestamp: number;
}

const searchCache: Record<string, CachedSearch> = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fallback stock data for search in case Yahoo Finance API fails
const fallbackStocks = [
  // Stocks
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
  { ticker: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc.', exchange: 'NYSE' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  { ticker: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  
  // ETFs
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', exchange: 'NYSE ARCA' },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', exchange: 'NYSE ARCA' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE ARCA' },
  { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', exchange: 'NYSE ARCA' },
];

// Function to search stocks using Yahoo Finance API
async function searchStocks(query: string): Promise<StockSearchResult[]> {
  // Check cache first
  const cachedData = searchCache[query];
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
    return cachedData.results;
  }
  
  try {
    // Search using Yahoo Finance API
    const searchResults = await yahooFinance.search(query);
    
    if (searchResults && searchResults.quotes && searchResults.quotes.length > 0) {
      // Map Yahoo Finance results to our format
      const results = searchResults.quotes
        .filter(quote => {
          // Check if it's an equity/stock/ETF by examining available properties
          const quoteObj = quote as any;
          return quoteObj.typeDisp === 'Equity' || 
                 quoteObj.quoteType === 'EQUITY' || 
                 quoteObj.typeDisp === 'ETF' || 
                 quoteObj.quoteType === 'ETF';
        })
        .map(quote => {
          const quoteObj = quote as any;
          return {
            ticker: quoteObj.symbol || '',
            name: quoteObj.shortname || quoteObj.longname || quoteObj.name || '',
            exchange: quoteObj.exchange || quoteObj.exchDisp || 'UNKNOWN'
          };
        });
      
      // Update cache
      searchCache[query] = {
        results,
        timestamp: now
      };
      
      return results;
    }
    
    throw new Error('No search results found');
  } catch (error) {
    console.error(`Error searching for stocks with query "${query}":`, error);
    
    // Fall back to static data
    const lowerQuery = query.toLowerCase();
    return fallbackStocks.filter(stock => 
      stock.ticker.toLowerCase().includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery)
    );
  }
}

// GET search stocks
export async function GET(req: NextRequest) {
  try {
    // Get user from session
    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query from search params
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }
    
    // Search for stocks using Yahoo Finance API
    const results = await searchStocks(query);
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error searching stocks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
