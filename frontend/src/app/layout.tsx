import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { ThemeProvider } from '@/providers/ThemeProvider';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Script
          src="https://cdn.teller.io/connect/connect.js"
          strategy="lazyOnload"
        />
        <ThemeProvider>
          <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 p-8 bg-[var(--background)]">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
