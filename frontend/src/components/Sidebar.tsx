'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { IconDashboard, IconTransaction, IconBudget, IconInsights, IconSettings } from '@/components/icons';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: <IconDashboard className="w-5 h-5" /> },
    { name: 'Transactions', href: '/transactions', icon: <IconTransaction className="w-5 h-5" /> },
    { name: 'Budgets', href: '/budgets', icon: <IconBudget className="w-5 h-5" /> },
    { name: 'Insights', href: '/insights', icon: <IconInsights className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings', icon: <IconSettings className="w-5 h-5" /> },
  ];

  const stats = [
    { label: 'Balance', value: '$12,560.00', type: 'neutral' },
    { label: 'Income', value: '+$2,300.00', type: 'income' },
    { label: 'Expenses', value: '-$1,150.00', type: 'expense' }
  ];

  return (
    <aside className="w-72 bg-[var(--card)] border-r border-[var(--border)]">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold mb-8">Finance Tracker</h1>
          
          {/* Quick Stats */}
          <div className="space-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-[var(--hover)]">
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{stat.label}</p>
                <p className={`text-xl font-bold amount-${stat.type}`}>
                  {stat.value}
                </p>
              </div>
            ))}
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
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)]">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn-secondary w-full flex items-center justify-center gap-3 py-3 text-base font-medium"
          >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    </aside>
  );
}
