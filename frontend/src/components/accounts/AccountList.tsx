import React, { useState } from 'react';
import { AccountData, deleteAccount } from '@/services/accountService';
import { AccountType } from '@/types/account';
import ViewNotesModal from './ViewNotesModal';

interface AccountListProps {
  accounts: AccountData[];
  onEdit: (account: AccountData) => void;
  onDelete: () => void;
}

const AccountList: React.FC<AccountListProps> = ({ accounts, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [viewingNotes, setViewingNotes] = useState<AccountData | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Calculate annual interest for savings accounts
  const calculateAnnualInterest = (balance: number, interestRate?: number) => {
    if (!interestRate) return 0;
    return balance * (interestRate / 100);
  };

  // Get account type display name
  const getAccountTypeDisplay = (type: AccountType) => {
    return type.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  // Check if account is a liability account
  const isLiabilityAccount = (type: AccountType) => {
    return [
      AccountType.CREDIT_CARD,
      AccountType.LOAN,
      AccountType.MORTGAGE
    ].includes(type);
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setConfirmDelete(true);
  };

  // Handle actual deletion
  const handleConfirmDelete = async () => {
    if (deletingId) {
      try {
        await deleteAccount(deletingId);
        setConfirmDelete(false);
        setDeletingId(null);
        onDelete();
      } catch (error) {
        console.error('Error deleting account:', error);
        // Error handling would be done here
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Institution
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Interest Rate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{account.name}</div>
                {account.accountNumber && (
                  <div className="text-xs text-gray-500">
                    ••••{account.accountNumber}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getAccountTypeDisplay(account.type)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{account.institution}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm font-medium ${isLiabilityAccount(account.type) ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(account.balance)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* For liability accounts, show interest rate */}
                {isLiabilityAccount(account.type) && (
                  <div className="text-sm text-gray-900">
                    {account.interestRate !== undefined ? `${account.interestRate.toFixed(2)}%` : 'N/A'}
                  </div>
                )}
                
                {/* For savings accounts, show only interest rate */}
                {account.type === AccountType.SAVINGS && (
                  <div className="text-sm text-gray-900">
                    {account.interestRate !== undefined ? `${account.interestRate.toFixed(2)}%` : 'N/A'}
                  </div>
                )}
                
                {/* For other account types, show dash */}
                {!isLiabilityAccount(account.type) && account.type !== AccountType.SAVINGS && (
                  <div className="text-sm text-gray-400">—</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(account)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setViewingNotes(account)}
                  className="text-green-600 hover:text-green-900 mr-4"
                  title="View account notes"
                >
                  📝 Notes
                </button>
                <button
                  onClick={() => handleDeleteClick(account.id!)}
                  className="text-red-600 hover:text-red-900"
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setConfirmDelete(false);
                  setDeletingId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Notes Modal */}
      {viewingNotes && (
        <ViewNotesModal
          notes={viewingNotes.notes || ''}
          accountName={viewingNotes.name}
          onClose={() => setViewingNotes(null)}
        />
      )}
    </div>
  );
};

export default AccountList;
