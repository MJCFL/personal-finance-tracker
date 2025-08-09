'use client';

import React, { useState, useEffect } from 'react';
import { getInvestmentAccounts, InvestmentAccountData } from '@/services/investmentService';
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

  // Fetch investment accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getInvestmentAccounts();
      setAccounts(data);
      
      // If there's a selected account, refresh its data
      if (selectedAccount) {
        const updatedAccount = data.find(acc => acc.id === selectedAccount.id);
        if (updatedAccount) {
          setSelectedAccount(updatedAccount);
        } else {
          setSelectedAccount(null);
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
            onAccountsChanged={fetchAccounts}
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
