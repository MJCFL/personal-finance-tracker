'use client';

import React, { useState, useEffect } from 'react';
import { getInvestmentAccounts, getInvestmentAccountById, InvestmentAccountData } from '@/services/investmentService';
import eventEmitter, { FINANCIAL_DATA_CHANGED } from '@/utils/eventEmitter';
import { InvestmentAccountType } from '@/types/investment';
import InvestmentAccountList from './InvestmentAccountList';
import InvestmentAccountDetails from './InvestmentAccountDetails';
import AddInvestmentAccountModal from './AddInvestmentAccountModal';
import LoadingSpinner from '../ui/LoadingSpinner';

const InvestmentPortfolio: React.FC = () => {
  const [accounts, setAccounts] = useState<InvestmentAccountData[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InvestmentAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto' | 'transactions' | 'cash'>('stocks');

  // Fetch investment accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getInvestmentAccounts();
      setAccounts(data);
      
      // If there's a selected account, refresh its data with the latest version
      if (selectedAccount && selectedAccount.id) {
        // Get fresh data directly from the API to ensure we have the latest state
        try {
          const freshAccount = await getInvestmentAccountById(selectedAccount.id);
          setSelectedAccount(freshAccount);
        } catch (accountError) {
          console.error('Error refreshing selected account:', accountError);
          // Fall back to finding the account in the list
          const updatedAccount = data.find(acc => acc.id === selectedAccount.id);
          if (updatedAccount) {
            setSelectedAccount(updatedAccount);
          } else {
            setSelectedAccount(null);
          }
        }
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch investment accounts');
      console.error('Error fetching investment accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);
  
  // Listen for financial data changes
  useEffect(() => {
    // Subscribe to financial data change events
    const unsubscribe = eventEmitter.on(FINANCIAL_DATA_CHANGED, () => {
      console.log('Financial data changed event received, refreshing accounts');
      fetchAccounts();
    });
    
    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Set default active tab based on account type when account is selected
  useEffect(() => {
    if (selectedAccount?.type === InvestmentAccountType.CRYPTO_WALLET) {
      setActiveTab('crypto');
    }
  }, [selectedAccount]);

  const handleSelectAccount = (account: InvestmentAccountData) => {
    setSelectedAccount(account);
  };

  const handleAccountAdded = () => {
    setIsAddModalOpen(false);
    fetchAccounts();
  };

  const handleAccountUpdated = () => {
    fetchAccounts();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Investment Accounts</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Add Account
          </button>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <p className="text-gray-600">No investment accounts found.</p>
            <p className="text-gray-600 mt-2">
              Click "Add Account" to create your first investment account.
            </p>
          </div>
        ) : (
          <InvestmentAccountList 
            accounts={accounts} 
            selectedAccountId={selectedAccount?.id}
            onSelectAccount={handleSelectAccount}
          />
        )}
      </div>
      
      <div className="lg:w-3/4">
        {selectedAccount ? (
          <InvestmentAccountDetails 
            account={selectedAccount} 
            onAccountUpdated={handleAccountUpdated}
            onAccountDeleted={() => {
              setSelectedAccount(null);
              fetchAccounts();
            }}
          />
        ) : (
          <div className="bg-gray-100 p-8 rounded-md text-center h-full flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Select an Investment Account
            </h3>
            <p className="text-gray-600">
              Select an investment account from the list to view details and manage your stocks.
            </p>
          </div>
        )}
      </div>
      
      {isAddModalOpen && (
        <AddInvestmentAccountModal
          onClose={() => setIsAddModalOpen(false)}
          onAccountAdded={handleAccountAdded}
        />
      )}
    </div>
  );
};

export default InvestmentPortfolio;
