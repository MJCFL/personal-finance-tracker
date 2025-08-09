'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getAccountById, updateAccount } from '@/services/accountService';
import { AccountData } from '@/services/accountService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AccountForm from '@/components/accounts/AccountForm';
import ErrorMessage from '@/components/ui/ErrorMessage';
import SuccessMessage from '@/components/ui/SuccessMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EditAccountPage() {
  // Use useParams hook instead of accessing params directly
  const params = useParams();
  const accountId = params.id as string;
  
  const [account, setAccount] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session && accountId) {
      fetchAccount();
    }
  }, [session, accountId]);

  const fetchAccount = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAccount = await getAccountById(accountId);
      console.log('Fetched account data:', fetchedAccount);
      setAccount(fetchedAccount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSaved = async (savedAccount: AccountData) => {
    try {
      await updateAccount(accountId, savedAccount);
      setSuccess('Account updated successfully!');
      // Refresh the account data
      fetchAccount();
    } catch (err: any) {
      setError(err.message || 'Failed to update account');
    }
  };

  const handleBackToAccounts = () => {
    router.push('/accounts');
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Account</h1>
          <button
            onClick={handleBackToAccounts}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
          >
            Back to Accounts
          </button>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        {isLoading ? (
          <div className="flex justify-center my-12">
            <LoadingSpinner />
          </div>
        ) : account ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <AccountForm 
              initialData={account} 
              onSave={handleAccountSaved} 
              isEdit={true}
              showBucketsManagement={true}
            />
          </div>
        ) : (
          <div className="text-center my-12">
            <p className="text-red-500">Account not found</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
