'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-500">Personal Finance Tracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => signIn('google')}
              className="px-6 py-2 rounded-full border border-gray-600 hover:border-blue-500 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => signIn('google')}
              className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Take Control of Your <span className="text-blue-500">Financial Future</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Track, analyze, and optimize your finances with our comprehensive personal finance management platform.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button 
            onClick={() => signIn('google')}
            className="px-8 py-3 bg-blue-600 rounded-full text-lg hover:bg-blue-700 transition-colors"
          >
            Start for Free
          </button>
          <button 
            onClick={() => signIn('google')}
            className="px-8 py-3 bg-gray-800 rounded-full text-lg hover:bg-gray-700 transition-colors"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          See <span className="text-blue-500">Features</span> in Action
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Dashboard Screenshot */}
          <div className="bg-gray-800 rounded-xl p-6 overflow-hidden">
            <h3 className="text-xl font-bold mb-4">Comprehensive Dashboard</h3>
            <p className="text-gray-300 mb-4">
              Get a complete overview of your finances with our intuitive dashboard. Track net worth, cash flow, budgets, and recent transactions all in one place.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image 
                src="/screenshots/dashboard.svg" 
                alt="Dashboard Screenshot" 
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Assets Screenshot */}
          <div className="bg-gray-800 rounded-xl p-6 overflow-hidden">
            <h3 className="text-xl font-bold mb-4">Asset Management</h3>
            <p className="text-gray-300 mb-4">
              Track all your assets including stocks, real estate, cash, and more. Get real-time updates on stock prices and monitor your portfolio growth.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image 
                src="/screenshots/assets.svg" 
                alt="Assets Screenshot" 
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Transactions Screenshot */}
          <div className="bg-gray-800 rounded-xl p-6 overflow-hidden">
            <h3 className="text-xl font-bold mb-4">Transaction Tracking</h3>
            <p className="text-gray-300 mb-4">
              Record and categorize all your financial transactions. Monitor your spending patterns and identify areas where you can save.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image 
                src="/screenshots/transactions.svg" 
                alt="Transactions Screenshot" 
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Budgets Screenshot */}
          <div className="bg-gray-800 rounded-xl p-6 overflow-hidden">
            <h3 className="text-xl font-bold mb-4">Budget Management</h3>
            <p className="text-gray-300 mb-4">
              Create and manage budgets for different spending categories. Track your progress and stay on top of your financial goals.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image 
                src="/screenshots/budgets.svg" 
                alt="Budgets Screenshot" 
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Accounts Screenshot */}
          <div className="bg-gray-800 rounded-xl p-6 overflow-hidden">
            <h3 className="text-xl font-bold mb-4">Account Management</h3>
            <p className="text-gray-300 mb-4">
              Connect and manage all your financial accounts in one place. Track balances, monitor transactions, and get a holistic view of your finances.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image 
                src="/screenshots/accounts.svg" 
                alt="Accounts Screenshot" 
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          
          {/* Analytics Screenshot */}
          <div className="bg-gray-800 rounded-xl p-6 overflow-hidden">
            <h3 className="text-xl font-bold mb-4">Advanced Analytics</h3>
            <p className="text-gray-300 mb-4">
              Gain insights into your financial data with interactive charts and visualizations. Make informed decisions based on your spending patterns.
            </p>
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image 
                src="/screenshots/analytics.svg" 
                alt="Analytics Screenshot" 
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-6 py-16 mt-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          Everything You Need to <span className="text-blue-500">Manage Your Money</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Track All Your Assets</h3>
            <p className="text-gray-300">
              Monitor stocks, real estate, cash, and other investments all in one place with real-time updates.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Budget Smarter</h3>
            <p className="text-gray-300">
              Create custom budgets, track expenses, and get insights on your spending habits to save more.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
            <p className="text-gray-300">
              Visualize your financial data with interactive charts and gain insights to make better decisions.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Transaction Tracking</h3>
            <p className="text-gray-300">
              Record and categorize all your financial transactions for complete visibility of your money flow.
            </p>
          </div>
          
          {/* Feature 5 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
            <p className="text-gray-300">
              Your financial data is encrypted and protected. We use Google authentication for secure access.
            </p>
          </div>
          
          {/* Feature 6 */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Multi-Device Access</h3>
            <p className="text-gray-300">
              Access your financial dashboard from any device with our responsive web application.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          How <span className="text-blue-500">It</span> Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-500">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Sign Up</h3>
            <p className="text-gray-300">
              Create your account in seconds using your Google account. No complicated forms.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-500">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Add Your Assets</h3>
            <p className="text-gray-300">
              Connect your accounts or manually add your assets and transactions.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-500">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Gain Insights</h3>
            <p className="text-gray-300">
              View your personalized dashboard with analytics and recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their financial future with our finance tools.
          </p>
          <button 
            onClick={() => signIn('google')}
            className="px-8 py-3 bg-white text-blue-700 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-blue-500">Personal Finance Tracker</span>
            <p className="text-gray-400 text-sm mt-1">
              © {new Date().getFullYear()} Personal Finance Tracker. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
