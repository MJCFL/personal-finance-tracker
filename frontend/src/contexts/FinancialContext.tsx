'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getFinancialSummary, FinancialSummary } from '@/services/insightsService';
import eventEmitter, { FINANCIAL_DATA_CHANGED } from '@/utils/eventEmitter';

interface FinancialContextType {
  financialSummary: FinancialSummary;
  isLoading: boolean;
  refreshFinancialData: () => Promise<void>;
}

const defaultFinancialSummary: FinancialSummary = {
  totalBalance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0
};

const FinancialContext = createContext<FinancialContextType>({
  financialSummary: defaultFinancialSummary,
  isLoading: true,
  refreshFinancialData: async () => {}
});

export const useFinancial = () => useContext(FinancialContext);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>(defaultFinancialSummary);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFinancialData = async () => {
    if (!session) {
      setFinancialSummary(defaultFinancialSummary);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const summary = await getFinancialSummary();
      setFinancialSummary(summary);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when session changes
  useEffect(() => {
    refreshFinancialData();
  }, [session]);
  
  // Listen for financial data change events
  useEffect(() => {
    const unsubscribe = eventEmitter.on(FINANCIAL_DATA_CHANGED, () => {
      refreshFinancialData();
    });
    
    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <FinancialContext.Provider value={{ financialSummary, isLoading, refreshFinancialData }}>
      {children}
    </FinancialContext.Provider>
  );
}
