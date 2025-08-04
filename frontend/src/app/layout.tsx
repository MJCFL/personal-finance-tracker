import type { Metadata } from 'next'
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import SessionProvider from '@/components/auth/SessionProvider';
import Script from 'next/script';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { FinancialProvider } from '@/contexts/FinancialContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Personal Finance Tracker',
  description: 'Track and manage your personal finances',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        <Script
          src="https://cdn.teller.io/connect/connect.js"
          strategy="lazyOnload"
        />
        <SessionProvider>
          <ThemeProvider>
            <FinancialProvider>
              <ResponsiveLayout>
                {children}
              </ResponsiveLayout>
            </FinancialProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
