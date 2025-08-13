// Jest globals are automatically available in the test environment
import { NextRequest, NextResponse } from 'next/server';
import { GET as getPriceHandler } from '@/app/api/cryptos/price/route';
import { GET as searchHandler } from '@/app/api/cryptos/search/route';

// Mock NextRequest
const createMockRequest = (params: Record<string, string>) => {
  const url = new URL('https://example.com');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return {
    nextUrl: url,
  } as unknown as NextRequest;
};

describe('Crypto API Routes', () => {
  describe('GET /api/cryptos/price', () => {
    it('should return a price for a valid symbol', async () => {
      const req = createMockRequest({ symbol: 'BTC' });
      const response = await getPriceHandler(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('price');
      expect(typeof data.price).toBe('number');
      expect(data.price).toBeGreaterThan(0);
    });
    
    it('should return an error for missing symbol', async () => {
      const req = createMockRequest({});
      const response = await getPriceHandler(req);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Symbol parameter is required');
    });
  });
  
  describe('GET /api/cryptos/search', () => {
    it('should return search results for a valid query', async () => {
      const req = createMockRequest({ query: 'bit' });
      const response = await searchHandler(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Check that Bitcoin is in the results
      const hasBitcoin = data.some((crypto: any) => 
        crypto.symbol === 'BTC' && crypto.name === 'Bitcoin'
      );
      expect(hasBitcoin).toBe(true);
    });
    
    it('should return an error for missing query', async () => {
      const req = createMockRequest({});
      const response = await searchHandler(req);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Query parameter is required');
    });
    
    it('should return empty array for non-matching query', async () => {
      const req = createMockRequest({ query: 'xyznonexistent' });
      const response = await searchHandler(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });
});
