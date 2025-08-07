'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getFinancialSummary, FinancialSummary } from '@/services/insightsService';
import eventEmitter, { FINANCIAL_DATA_CHANGED } from '@/utils/eventEmitter';

// Cache key for storing financial summary in localStorage
const FINANCIAL_SUMMARY_CACHE_KEY = 'financialSummaryCache';

interface FinancialContextType {
  financialSummary: FinancialSummary;
  isLoading: boolean;
  refreshFinancialData: () => Promise<void>;
}

const defaultFinancialSummary: FinancialSummary = {
  totalBalance: 0,
  netWorth: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0
};

const FinancialContext = createContext<FinancialContextType>({
  financialSummary: defaultFinancialSummary,
  isLoading: true,
  refreshFinancialData: async () => {}
});

export const useFinancial = () => useContext(FinancialContext);

// Helper function to load cached financial summary from localStorage
const loadCachedFinancialSummary = (): FinancialSummary | null => {
  if (typeof window === 'undefined') return null; // Server-side check
  
  try {
    const cachedData = localStorage.getItem(FINANCIAL_SUMMARY_CACHE_KEY);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      console.log('Loaded cached financial summary:', parsedData);
      return parsedData;
    }
  } catch (error) {
    console.error('Error loading cached financial summary:', error);
  }
  return null;
};

// Helper function to save financial summary to localStorage
const saveCachedFinancialSummary = (summary: FinancialSummary): void => {
  if (typeof window === 'undefined') return; // Server-side check
  
  try {
    // Only cache if the summary has valid non-zero values
    if (summary.netWorth !== 0 || summary.totalBalance !== 0 || 
        summary.monthlyIncome !== 0 || summary.monthlyExpenses !== 0) {
      localStorage.setItem(FINANCIAL_SUMMARY_CACHE_KEY, JSON.stringify(summary));
      console.log('Saved financial summary to cache:', summary);
    }
  } catch (error) {
    console.error('Error saving financial summary to cache:', error);
  }
};

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  // Initialize with cached data if available, otherwise use default
  const cachedSummary = loadCachedFinancialSummary();
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>(
    cachedSummary || defaultFinancialSummary
  );
  const [isLoading, setIsLoading] = useState(true);

  const refreshFinancialData = async () => {
    if (!session) {
      // Check for cached data first before defaulting to zeros
      const cachedData = loadCachedFinancialSummary();
      if (cachedData) {
        console.log('No active session, using cached financial data');
        setFinancialSummary(cachedData);
      } else {
        setFinancialSummary(defaultFinancialSummary);
      }
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const summary = await getFinancialSummary();
      
      // Only update state if we got valid data (non-zero values)
      if (summary && (summary.netWorth !== 0 || summary.totalBalance !== 0 || 
          summary.monthlyIncome !== 0 || summary.monthlyExpenses !== 0)) {
        setFinancialSummary(summary);
        saveCachedFinancialSummary(summary);
      } else {
        console.warn('Received potentially invalid financial summary:', summary);
        // Use cached data if available and current data seems invalid
        const cachedData = loadCachedFinancialSummary();
        if (cachedData) {
          console.log('Using cached financial data instead of potentially invalid data');
          setFinancialSummary(cachedData);
        }
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      // Use cached data on error
      const cachedData = loadCachedFinancialSummary();
      if (cachedData) {
        console.log('Using cached financial data due to fetch error');
        setFinancialSummary(cachedData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when session changes
  useEffect(() => {
    refreshFinancialData();
    
    // If session is null but we had a previous session, this might be a session timeout
    // In this case, we should still show cached data if available
    if (!session) {
      const cachedData = loadCachedFinancialSummary();
      if (cachedData) {
        console.log('No active session, using cached financial data');
        setFinancialSummary(cachedData);
      }
    }
  }, [session]);
  
  // Listen for financial data change events
  useEffect(() => {
    const unsubscribe = eventEmitter.on(FINANCIAL_DATA_CHANGED, () => {
      console.log('Financial data changed event received, refreshing data...');
      refreshFinancialData();
    });
    
    // Set up periodic refresh for financial data (every 5 seconds)
    // Reduced from 10 seconds to ensure more timely updates
    const intervalId = setInterval(() => {
      console.log('Periodic financial data refresh');
      refreshFinancialData();
    }, 5000);
    
    // Set up session check interval (every 30 seconds)
    // This helps detect session timeouts and ensures we keep showing data
    const sessionCheckId = setInterval(() => {
      console.log('Session check interval');
      // If we have cached data but no session, we might be in a timeout situation
      if (!session) {
        const cachedData = loadCachedFinancialSummary();
        if (cachedData) {
          console.log('Session check: No active session, using cached financial data');
          setFinancialSummary(cachedData);
        }
      }
    }, 30000);
    
    // Clean up subscription and intervals when component unmounts
    return () => {
      unsubscribe();
      clearInterval(intervalId);
      clearInterval(sessionCheckId);
    };
  }, [session]); // Added session dependency to react to session changes

  return (
    <FinancialContext.Provider value={{ financialSummary, isLoading, refreshFinancialData }}>
      {children}
    </FinancialContext.Provider>
  );
}
