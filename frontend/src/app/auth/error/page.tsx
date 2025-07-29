'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  let errorMessage = 'An unknown error occurred during authentication';
  
  if (error === 'AccessDenied') {
    errorMessage = 'Access denied. You may not have permission to access this resource.';
  } else if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration.';
  } else if (error === 'Verification') {
    errorMessage = 'The verification link may have expired or has already been used.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Authentication Error
          </h2>
          <div className="mt-4 bg-red-900 text-red-200 p-4 rounded-md">
            <p>{errorMessage}</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/auth/signin" className="font-medium text-indigo-400 hover:text-indigo-300 mr-4">
            Try signing in again
          </Link>
          <Link href="/" className="font-medium text-indigo-400 hover:text-indigo-300">
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
