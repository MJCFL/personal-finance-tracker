import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Personal Finance Tracker',
  description: 'Track your finances and get predictive insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 bg-gray-50 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
