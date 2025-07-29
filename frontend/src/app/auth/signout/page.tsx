'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function SignOut() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Sign out
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Are you sure you want to sign out?
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign out
          </button>
          <div className="text-center">
            <Link href="/" className="font-medium text-indigo-400 hover:text-indigo-300">
              Cancel and return to the homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
