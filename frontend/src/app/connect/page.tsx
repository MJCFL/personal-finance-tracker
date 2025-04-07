'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnectBank() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectBank = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get enrollment token from our backend
      const response = await fetch('http://localhost:5000/api/accounts/enrollment-token');
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('Failed to get enrollment token');
      }

      // Initialize Teller Connect
      const { token } = data;
      const config = {
        environment: 'sandbox',
        enrollment_id: token,
        onSuccess: (enrollment: any) => {
          console.log('Successfully connected bank:', enrollment);
          // Store the access token and redirect to dashboard
          localStorage.setItem('teller_access_token', enrollment.accessToken);
          router.push('/');
        },
        onExit: () => {
          console.log('User exited bank connection flow');
          setLoading(false);
        },
        onError: (error: Error) => {
          console.error('Error connecting bank:', error);
          setError('Failed to connect bank. Please try again.');
          setLoading(false);
        },
      };

      // @ts-ignore - Teller types not available
      window.TellerConnect.setup(config).open();
      
    } catch (error) {
      console.error('Error initiating bank connection:', error);
      setError('Failed to initiate bank connection. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Connect Your Bank Account</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Securely connect your bank account to track your finances. We use Teller to ensure your banking information is safe and protected.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <button
          onClick={connectBank}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Connecting...' : 'Connect Bank Account'}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          By connecting your account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
