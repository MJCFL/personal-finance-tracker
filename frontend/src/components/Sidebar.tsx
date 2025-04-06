'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Overview', path: '/', icon: '📊' },
  { name: 'Accounts', path: '/accounts', icon: '🏦' },
  { name: 'Budget', path: '/budget', icon: '💰' },
  { name: 'Goals', path: '/goals', icon: '🎯' },
  { name: 'Reports', path: '/reports', icon: '📈' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Finance Tracker</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${
                  pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
