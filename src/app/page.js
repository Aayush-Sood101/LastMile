'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-2">Neighborhood Bulk Order Coordinator</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Save money and reduce emissions with grouped deliveries in your neighborhood
        </p>
      </header>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'user' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('user')}
          >
            User
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === 'walmart' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('walmart')}
          >
            Walmart Admin
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'user' ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <Link href="/auth/login" className="btn-primary text-center">
                  Log In
                </Link>
                <Link href="/auth/register" className="btn-secondary text-center">
                  Sign Up
                </Link>
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                Join your neighborhood bulk ordering community and save on deliveries
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <Link href="/auth/login" className="btn-primary text-center">
                  Log In as Admin
                </Link>
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                Admin access for Walmart staff only.<br />
                <span className="text-xs">(Use walmart@admin.com / password123)</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Reduced Carbon Footprint</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Group Savings</span>
          </div>
        </div>
        <p>© {new Date().getFullYear()} Neighborhood Bulk Order Coordinator</p>
      </footer>
    </div>
  );
}