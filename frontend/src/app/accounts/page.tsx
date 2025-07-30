'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAccounts } from '@/services/accountService';
import AccountList from '@/components/accounts/AccountList';
import AccountForm from '@/components/accounts/AccountForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AccountData } from '@/services/accountService';
import { AccountType } from '@/types/account';
import Modal from '@/components/ui/Modal';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [activeFilter, setActiveFilter] = useState<AccountType | 'all'>('all');
  const { data: session } = useSession();

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, [session]);

  // Fetch accounts with optional filtering
  const fetchAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = activeFilter !== 'all' ? { type: activeFilter as AccountType } : undefined;
      const fetchedAccounts = await getAccounts(filters);
      setAccounts(fetchedAccounts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account creation/update success
  const handleAccountSaved = () => {
    setShowModal(false);
    setEditingAccount(null);
    fetchAccounts();
    setSuccess('Account saved successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Open modal for creating a new account
  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  // Open modal for editing an existing account
  const handleEditAccount = (account: AccountData) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  // Handle account deletion success
  const handleAccountDeleted = () => {
    fetchAccounts();
    setSuccess('Account deleted successfully!');
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Filter accounts by type
  const handleFilterChange = (filter: AccountType | 'all') => {
    setActiveFilter(filter);
    // Re-fetch accounts with the new filter
    setIsLoading(true);
    const filters = filter !== 'all' ? { type: filter } : undefined;
    getAccounts(filters)
      .then(fetchedAccounts => {
        setAccounts(fetchedAccounts);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch accounts');
        setIsLoading(false);
      });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Financial Accounts</h1>
        
        {/* Error and Success Messages */}
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
        {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}
        
        {/* Account Filters */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Filter by Account Type</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            {Object.values(AccountType).map(type => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-4 py-2 rounded ${activeFilter === type ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        {/* Add Account Button */}
        <div className="mb-6">
          <button
            onClick={handleAddAccount}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add New Account
          </button>
        </div>
        
        {/* Account List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 bg-gray-100 rounded-lg">
            <p className="text-gray-500">No accounts found. Add your first account to get started!</p>
          </div>
        ) : (
          <AccountList 
            accounts={accounts} 
            onEdit={handleEditAccount} 
            onDelete={handleAccountDeleted} 
          />
        )}
        
        {/* Account Form Modal */}
        {showModal && (
          <Modal
            title={editingAccount ? 'Edit Account' : 'Add New Account'}
            onClose={() => {
              setShowModal(false);
              setEditingAccount(null);
            }}
          >
            <AccountForm 
              account={editingAccount}
              onSave={handleAccountSaved}
              onCancel={() => {
                setShowModal(false);
                setEditingAccount(null);
              }}
            />
          </Modal>
        )}
      </div>
    </ProtectedRoute>
  );
}
