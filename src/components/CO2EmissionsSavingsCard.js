'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCO2Savings } from '@/utils/logisticsApi';
import { toast } from 'react-hot-toast';

const CO2EmissionsSavingsCard = ({ orderId, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);
  const [params, setParams] = useState({
    numHouseholds: 50,
    indivDistanceKm: 4,
    bulkDistanceKm: 10
  });
  
  const loadCO2Data = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const result = await getCO2Savings(orderId, params);
      setData(result.co2Savings);
    } catch (error) {
      console.error('Error loading CO2 data:', error);
      toast.error('Failed to load emissions data');
    } finally {
      setLoading(false);
    }
  }, [orderId, params]);
  
  useEffect(() => {
    if (!initialData && orderId) {
      loadCO2Data();
    }
  }, [orderId, initialData, loadCO2Data]);
  
  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const handleRefresh = () => {
    loadCO2Data();
  };
  
  if (!data && loading) {
    return (
      <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-lg shadow-md border border-green-100">
        <div className="h-7 bg-green-100 rounded w-3/4 mb-6 animate-pulse"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-5 rounded-lg h-24 animate-pulse flex items-center justify-center">
            <svg className="w-10 h-10 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <div className="bg-blue-50 p-5 rounded-lg h-24 animate-pulse flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="h-5 bg-gray-100 rounded w-full animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded w-5/6 animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded w-4/6 animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded w-5/6 animate-pulse"></div>
        </div>
        
        <div className="h-20 bg-green-100 rounded w-full animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-lg shadow-md border border-green-100">
      <h3 className="text-xl font-semibold mb-4 text-green-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        CO₂ Emissions Savings
      </h3>
      
      {data ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg shadow-sm border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2 flex items-baseline">
                {data.emissionSaved.toFixed(2)} 
                <span className="text-base ml-1 text-green-700">kg CO₂</span>
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Total CO₂ emissions saved
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg shadow-sm border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2 flex items-baseline">
                {data.relativeReduction.toFixed(1)}
                <span className="text-base ml-1 text-blue-700">%</span>
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                Emission reduction percentage
              </div>
            </div>
          </div>
          
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h4 className="text-md font-medium mb-3 text-gray-700">Delivery Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Households Served:
                </span>
                <span className="font-medium text-gray-800">{data.numHouseholds}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Individual Deliveries:
                </span>
                <span className="font-medium text-red-500">{data.emissionIndividual.toFixed(2)} kg CO₂</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Bulk Delivery:
                </span>
                <span className="font-medium text-green-500">{data.emissionBulk.toFixed(2)} kg CO₂</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Distance to Community:
                </span>
                <span className="font-medium text-gray-800">{data.bulkDistanceKm} km</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Number of Trucks:
                </span>
                <span className="font-medium text-gray-800">{data.numTrucks}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-16 h-16 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h4 className="text-md font-medium mb-2 text-green-800">Environmental Impact</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              By making bulk deliveries instead of individual trips, this order helps reduce carbon emissions equivalent to
              planting approximately <span className="font-bold text-green-700">{Math.ceil(data.emissionSaved / 22)} trees</span>. 
              (A typical tree absorbs about 22kg of CO₂ per year)
            </p>
            <div className="mt-3 flex">
              {Array.from({ length: Math.min(5, Math.ceil(data.emissionSaved / 22)) }).map((_, i) => (
                <svg key={i} className="h-5 w-5 text-green-600 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L8 8H3L7 13L5 19L12 15L19 19L17 13L21 8H16L12 2Z"/>
                </svg>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
            Adjust parameters below to calculate CO₂ emissions savings for this order.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Households
              </label>
              <input
                type="number"
                name="numHouseholds"
                min="1"
                value={params.numHouseholds}
                onChange={handleParamChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avg. Individual Trip (km)
              </label>
              <input
                type="number"
                name="indivDistanceKm"
                min="0.1"
                step="0.1"
                value={params.indivDistanceKm}
                onChange={handleParamChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulk Delivery Distance (km)
              </label>
              <input
                type="number"
                name="bulkDistanceKm"
                min="0.1"
                step="0.1"
                value={params.bulkDistanceKm}
                onChange={handleParamChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-md hover:from-green-600 hover:to-green-700 transition shadow-sm flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculate CO₂ Savings
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CO2EmissionsSavingsCard;
