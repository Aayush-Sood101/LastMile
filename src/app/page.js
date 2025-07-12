'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-green-700 mb-4">
          <span className="relative">
            LastMile
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-green-500 rounded-full"></span>
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Optimize the last mile with smart neighborhood deliveries
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Save Money
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Reduce Emissions
          </span>
        </div>
      </header>

      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'user' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('user')}
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Neighborhood User
            </span>
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium transition-all duration-200 ${
              activeTab === 'walmart' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('walmart')}
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Admin Portal
            </span>
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'user' ? (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Join Your Neighborhood Network</h3>
                <p className="text-sm text-gray-600 mt-1">Connect with neighbors and save on deliveries</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/auth/login" className="btn-primary text-center flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Log In
                </Link>
                <Link href="/auth/register" className="btn-secondary text-center flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </Link>
              </div>
              <div className="text-xs text-gray-500 text-center mt-6 border-t pt-4">
                Join LastMile to coordinate bulk orders with neighbors and save on delivery costs while reducing carbon emissions.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Admin Portal</h3>
                <p className="text-sm text-gray-600 mt-1">Manage deliveries and optimize routes</p>
              </div>
              <div className="flex flex-col gap-4">
                <Link href="/auth/login" className="btn-primary text-center flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Admin Login
                </Link>
              </div>
              <div className="text-xs text-gray-500 text-center mt-6 border-t pt-4">
                Secure access for authorized personnel only. Manage delivery cycles, optimize pricing, and coordinate community deliveries.
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="w-full max-w-5xl mx-auto mt-16 mb-12 px-4">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">How LastMile Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">1. Join a Community</h3>
            <p className="text-gray-600">Connect with neighbors in your area who want to save on delivery costs</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">2. Shop Together</h3>
            <p className="text-gray-600">Coordinate bulk orders with your community for maximum efficiency</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">3. Save Money</h3>
            <p className="text-gray-600">Enjoy reduced delivery fees and contribute to lower carbon emissions</p>
          </div>
        </div>
      </section>
      
      <footer className="mt-16 text-center text-gray-500 text-sm border-t border-gray-200 pt-8 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Reduced Carbon Footprint</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Group Savings</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-amber-500 rounded-full mr-2"></div>
            <span>Community Building</span>
          </div>
        </div>
        <p className="mb-2">© {new Date().getFullYear()} LastMile - Optimizing the neighborhood delivery experience</p>
        <div className="flex justify-center space-x-4 text-xs">
          <a href="#" className="text-gray-500 hover:text-green-600">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="text-gray-500 hover:text-green-600">Terms of Service</a>
          <span>|</span>
          <a href="#" className="text-gray-500 hover:text-green-600">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}