import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // In a real application, you would call a crypto search API here
    // For demo purposes, we'll return mock data
    const results = await searchMockCryptos(query);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error searching cryptos:', error);
    return NextResponse.json({ error: error.message || 'Failed to search cryptos' }, { status: 500 });
  }
}

// Mock function to search cryptocurrencies
async function searchMockCryptos(query: string): Promise<any[]> {
  // Common cryptocurrencies with images
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    { symbol: 'ETH', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { symbol: 'SOL', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
    { symbol: 'ADA', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
    { symbol: 'DOT', name: 'Polkadot', image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
    { symbol: 'AVAX', name: 'Avalanche', image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
    { symbol: 'MATIC', name: 'Polygon', image: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
    { symbol: 'LINK', name: 'Chainlink', image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
    { symbol: 'XRP', name: 'Ripple', image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
    { symbol: 'DOGE', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
    { symbol: 'SHIB', name: 'Shiba Inu', image: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png' },
    { symbol: 'UNI', name: 'Uniswap', image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
    { symbol: 'ATOM', name: 'Cosmos', image: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png' },
    { symbol: 'LTC', name: 'Litecoin', image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png' },
    { symbol: 'XLM', name: 'Stellar', image: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png' },
    { symbol: 'ALGO', name: 'Algorand', image: 'https://assets.coingecko.com/coins/images/4380/small/download.png' },
    { symbol: 'FIL', name: 'Filecoin', image: 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png' },
    { symbol: 'NEAR', name: 'NEAR Protocol', image: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg' },
    { symbol: 'ICP', name: 'Internet Computer', image: 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png' },
    { symbol: 'VET', name: 'VeChain', image: 'https://assets.coingecko.com/coins/images/1167/small/VeChain-Logo-768x725.png' },
  ];

  // Normalize the query
  const normalizedQuery = query.toLowerCase();
  
  // Filter cryptos based on the query
  return cryptos.filter(crypto => 
    crypto.symbol.toLowerCase().includes(normalizedQuery) || 
    crypto.name.toLowerCase().includes(normalizedQuery)
  );
}
