'use client';

import React, { useState } from 'react';
import BudgetList from '@/components/budgets/BudgetList';
import BudgetForm from '@/components/budgets/BudgetForm';
import ExpenseForm from '@/components/budgets/ExpenseForm';
import BudgetReports from '@/components/budgets/BudgetReports';
import { Budget } from '@/types/budget';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Modal from '@/components/ui/Modal';

// Using Budget type from @/types/budget

export default function BudgetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState<'budgets' | 'expenses' | 'reports'>('budgets');

  const handleCreateBudget = () => {
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Budget Management</h1>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'budgets' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('budgets')}
          >
            My Budgets
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'expenses' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('expenses')}
          >
            Record Expenses
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
              onCreateBudget={handleCreateBudget}
              onEditBudget={handleEditBudget}
            />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="mb-8 max-w-2xl mx-auto">
            <ExpenseForm />
          </div>
        )}

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
            budget={selectedBudget || undefined}
            onSuccess={handleCloseModal}
          />
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
