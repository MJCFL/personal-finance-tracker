'use client';

import React, { useState } from 'react';
import BudgetList from '@/components/budgets/BudgetList';
import BudgetForm from '@/components/budgets/BudgetForm';
import BudgetReports from '@/components/budgets/BudgetReports';
import { Budget } from '@/types/budget';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Modal from '@/components/ui/Modal';

// Using Budget type from @/types/budget

export default function BudgetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState<'budgets' | 'reports'>('budgets');
  // Add a key to force re-render of BudgetList
  const [budgetListKey, setBudgetListKey] = useState(0);
  // Add a key to force re-render of BudgetForm
  const [budgetFormKey, setBudgetFormKey] = useState(0);

  const handleCreateBudget = () => {
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    console.log('BudgetsPage: Editing budget:', budget);
    setSelectedBudget(budget);
    // Increment the budget form key to force a fresh render
    setBudgetFormKey(prev => prev + 1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Force BudgetList to re-render when modal closes
    setBudgetListKey(prev => prev + 1);
    console.log('BudgetsPage: Modal closed, forcing BudgetList refresh');
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Budget Management</h1>
        
        {/* Information banner about automatic transaction tracking */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>New Feature:</strong> Budget spending is now automatically calculated from your transactions. 
                When you create transactions with matching categories, they'll automatically count toward your budget totals.
              </p>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'budgets' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('budgets')}
          >
            My Budgets
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'reports' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports & Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'budgets' && (
          <div className="mb-8">
            <BudgetList
              key={budgetListKey}
              onCreateBudget={handleCreateBudget}
              onEditBudget={handleEditBudget}
            />
          </div>
        )}

        {/* Expenses tab removed - now using transaction data automatically */}

        {activeTab === 'reports' && (
          <div className="mb-8">
            <BudgetReports />
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedBudget ? 'Edit Budget' : 'Create Budget'}
        >
          <BudgetForm
            key={budgetFormKey}
            budget={selectedBudget || undefined}
            onSuccess={handleCloseModal}
          />
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
