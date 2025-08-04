'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { useSession, signIn, signOut } from 'next-auth/react';
import { HomeIcon, BanknotesIcon, ChartBarIcon, WalletIcon, Cog6ToothIcon, UserIcon, PresentationChartLineIcon, CreditCardIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import HelpButton from './onboarding/HelpButton';
import { useFinancial } from '@/contexts/FinancialContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const { financialSummary, isLoading } = useFinancial();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Accounts', href: '/accounts', icon: BanknotesIcon },
    { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
    { name: 'Assets', href: '/assets', icon: ChartBarIcon },
    { name: 'Investments', href: '/investments', icon: CurrencyDollarIcon },
    { name: 'Debts', href: '/debts', icon: CreditCardIcon },
    { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
    { name: 'Budgets', href: '/budgets', icon: WalletIcon },
    { name: 'Insights', href: '/insights', icon: WalletIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const stats = [
    { 
      label: 'Balance', 
      value: formatCurrency(financialSummary.totalBalance), 
      type: 'neutral' 
    },
    { 
      label: 'Income', 
      value: '+' + formatCurrency(financialSummary.monthlyIncome), 
      type: 'income' 
    },
    { 
      label: 'Expenses', 
      value: '-' + formatCurrency(financialSummary.monthlyExpenses), 
      type: 'expense' 
    }
  ];

  return (
    <aside className="w-72 bg-[var(--card)] border-r border-[var(--border)]">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold mb-8">Finance Tracker</h1>
          
          {/* Quick Stats */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton for stats
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-[var(--hover)]">
                    <div className="h-4 w-20 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                    <div className="h-6 w-28 bg-gray-700/50 rounded animate-pulse"></div>
                  </div>
                ))}
              </>
            ) : (
              // Actual stats when loaded
              stats.map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-[var(--hover)]">
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold amount-${stat.type}`}>
                    {stat.value}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <div className="px-4 mb-4 text-sm font-medium text-[var(--text-secondary)]">
            MENU
          </div>
          <div className="space-y-2 px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 nav-link ${
                  pathname === item.href ? 'active' : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)] space-y-4">
          {/* User Authentication */}
          <div className="mb-4">
            {status === 'loading' ? (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : session ? (
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {session.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium mb-1">{session.user?.name || 'Authenticated User'}</p>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{session.user?.email}</p>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm font-medium"
              >
                <UserIcon className="h-4 w-4" />
                Sign in
              </button>
            )}
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-secondary w-full flex items-center justify-center gap-3 py-3 text-base font-medium mb-3"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          
          {/* Help Button */}
          <HelpButton />
        </div>
      </div>
    </aside>
  );
}
