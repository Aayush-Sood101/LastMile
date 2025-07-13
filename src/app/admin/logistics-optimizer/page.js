'use client';

import PageHeader from '@/components/PageHeader';
import LogisticsOptimizer from '@/components/LogisticsOptimizer';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaChevronLeft, FaSignOutAlt, FaStore } from 'react-icons/fa';

export default function LogisticsOptimizerPage() {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  useEffect(() => {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/auth/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'walmart') {
      router.push('/dashboard');
      return;
    }
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar - Desktop */}
      <div className="bg-white shadow-md border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-primary-600 text-white p-2 rounded-lg mr-3">
                <FaStore className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">LastMile Admin</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                <FaChevronLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Bar - Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md text-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="bg-primary-600 text-white p-2 rounded-lg mr-2">
              <FaStore className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">LastMile Admin</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              <FaChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-200"
            >
              <FaSignOutAlt className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>
      </div>
      
      <main className="pt-20 md:pt-0 pb-12">
        <PageHeader 
          title="Logistics & Discount Optimizer" 
          description="Optimize discounts while considering logistics constraints and maximizing CO₂ savings"
        />
        <LogisticsOptimizer />
      </main>
    </div>
  );
}
