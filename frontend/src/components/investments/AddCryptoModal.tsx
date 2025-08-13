'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { addCrypto, searchCryptos, getCryptoPrice } from '@/services/investmentService';
import { handleNumberInputChange } from '@/utils/inputHelpers';

interface AddCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onAdd: () => void;
}

interface CryptoSearchResult {
  symbol: string;
  name: string;
  image?: string;
}

export default function AddCryptoModal({ isOpen, onClose, accountId, onAdd }: AddCryptoModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CryptoSearchResult[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSearchResult | null>(null);
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search for cryptos when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // Reduced debounce time for better responsiveness

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Search for cryptos
  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const results = await searchCryptos(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching cryptos:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a crypto from search results
  const handleSelectCrypto = async (crypto: CryptoSearchResult) => {
    setSelectedCrypto(crypto);
    setSearchQuery(''); // Clear search query
    setSearchResults([]); // Clear search results
    
    // Fetch current price
    try {
      setIsFetchingPrice(true);
      const price = await getCryptoPrice(crypto.symbol);
      setCurrentPrice(price);
      setPurchasePrice(price.toFixed(2)); // Set purchase price to current price as default
    } catch (error: any) {
      console.error('Error fetching crypto price:', error);
      setError(`Could not fetch current price: ${error.message || 'Unknown error'}. You can still proceed with manual price entry.`);
      // Don't set purchase price if we couldn't fetch it
    } finally {
      setIsFetchingPrice(false);
    }
  };
  
  // Refresh price for selected crypto
  const refreshPrice = async () => {
    if (!selectedCrypto) return;
    
    try {
      setIsFetchingPrice(true);
      setError(null);
      const price = await getCryptoPrice(selectedCrypto.symbol);
      setCurrentPrice(price);
      // Don't automatically update purchase price on refresh
    } catch (error: any) {
      console.error('Error refreshing crypto price:', error);
      setError(`Could not refresh price: ${error.message || 'Unknown error'}`);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedCrypto(null);
    setAmount('');
    setPurchasePrice('');
    setCurrentPrice(null);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!selectedCrypto || !amount || !purchasePrice) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Add crypto to account
      await addCrypto(accountId, {
        symbol: selectedCrypto.symbol,
        name: selectedCrypto.name,
        amount: parseFloat(amount),
        purchasePrice: parseFloat(purchasePrice),
        purchaseDate: new Date(purchaseDate),
        notes: notes || undefined
      });

      // Reset form and close modal
      resetForm();
      onClose();
      onAdd();
    } catch (error: any) {
      console.error('Error adding crypto:', error);
      setError(error.message || 'Failed to add crypto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Cryptocurrency">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="cryptoSearch" className="block text-sm font-medium text-gray-700 mb-1">
            Search Cryptocurrency *
          </label>
          <div className="relative">
            {!selectedCrypto ? (
              <input
                type="text"
                id="cryptoSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name or symbol (e.g., Bitcoin or BTC)"
                disabled={isSubmitting}
                autoComplete="off"
              />
            ) : (
              <div className="flex items-center">
                <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-full mr-2">
                  {selectedCrypto.image && (
                    <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-5 h-5 mr-1.5" />
                  )}
                  <span className="font-medium text-blue-800">{selectedCrypto.symbol.toUpperCase()}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedCrypto(null);
                      setSearchQuery('');
                    }}
                    className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    ×
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedCrypto(null);
                    setSearchQuery('');
                  }}
                  className="text-sm text-blue-600 hover:underline focus:outline-none"
                >
                  Change
                </button>
              </div>
            )}
            {isSearching && (
              <div className="absolute right-3 top-2">
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
                  <span className="text-gray-400 text-sm">Searching...</span>
                </div>
              </div>
            )}
            
            {/* Search results dropdown */}
            {searchResults.length > 0 && !selectedCrypto && (
              <div className="mt-1 border border-gray-300 rounded bg-white shadow-sm max-h-40 overflow-auto z-20 absolute" style={{ width: '100%', maxWidth: '100%' }}>
                {searchResults.length === 0 ? (
                  <div className="p-1 text-gray-500 text-xs">No cryptocurrencies found</div>
                ) : (
                  searchResults.map((crypto) => (
                    <div 
                      key={crypto.symbol}
                      className="py-1.5 px-2 hover:bg-gray-100 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSelectCrypto(crypto)}
                    >
                      {crypto.image && (
                        <img src={crypto.image} alt={crypto.name} className="w-5 h-5 mr-2" />
                      )}
                      <div className="flex items-center">
                        <span className="font-medium text-sm text-gray-900">{crypto.symbol.toUpperCase()}</span>
                        <span className="text-gray-500 ml-1 text-xs">({crypto.name})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* No results message */}
          {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && !selectedCrypto && (
            <div className="mt-1 p-2 text-sm text-gray-500 border border-gray-200 rounded bg-gray-50 relative">
              No cryptocurrencies found matching "{searchQuery}"
            </div>
          )}
          
          {/* Selected crypto display */}
          {selectedCrypto && (
            <div className="mt-2 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedCrypto.image && (
                    <div className="bg-white p-2 rounded-full shadow-md mr-3">
                      <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-10 h-10" />
                    </div>
                  )}
                  <div className="text-white">
                    <div className="font-bold text-xl">{selectedCrypto.name}</div>
                    <div className="text-blue-300 font-medium text-lg">{selectedCrypto.symbol.toUpperCase()}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCrypto(null);
                    setCurrentPrice(null);
                    setPurchasePrice('');
                    setSearchQuery('');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 shadow-md font-medium"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Current price display */}
        {currentPrice !== null && selectedCrypto && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded flex justify-between items-center">
              <p className="text-sm text-green-800">
                Current price: <span className="font-bold">${currentPrice.toFixed(2)}</span>
                {isFetchingPrice && <span className="ml-2 text-xs">(updating...)</span>}
              </p>
              <button 
                type="button"
                onClick={refreshPrice}
                disabled={isFetchingPrice}
                className={`text-xs px-2 py-1 rounded ${isFetchingPrice ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                {isFetchingPrice ? 'Refreshing...' : 'Refresh Price'}
              </button>
            </div>
          )}
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.25"
            step="0.000001"
            min="0.000001"
            required
            disabled={!selectedCrypto}
          />
        </div>
        
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Price ($) *
          </label>
          <input
            type="number"
            id="purchasePrice"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="35000.00"
            step="0.01"
            min="0"
            required
            disabled={!selectedCrypto}
          />
        </div>
        
        <div>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Date *
          </label>
          <input
            type="date"
            id="purchaseDate"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!selectedCrypto}
          />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional notes about this purchase"
            rows={3}
            disabled={!selectedCrypto}
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white transition flex items-center ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isSubmitting || !selectedCrypto}
          >
            {isSubmitting && (
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
            )}
            {isSubmitting ? 'Adding...' : 'Add Crypto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
