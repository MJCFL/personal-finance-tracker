'use client';

import React from 'react';
import Overview from '@/components/Overview';
import Transactions from '@/components/Transactions';
import Accounts from '@/components/Accounts';
import Categories from '@/components/Categories';
import Settings from '@/components/Settings';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      
      <div className="space-y-8">
        <Overview />
        <Transactions />
        <Accounts />
        <Categories />
        <Settings />
      </div>
    </main>
  );
}
