'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check for demo mode on component mount
  useEffect(() => {
    const demoMode = Cookies.get('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  useEffect(() => {
    // If the user is not authenticated and not in demo mode, redirect to sign in
    if (status === 'unauthenticated' && !isDemoMode) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname, isDemoMode]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated or in demo mode, render the children
  return (session || isDemoMode) ? <>{children}</> : null;
}
