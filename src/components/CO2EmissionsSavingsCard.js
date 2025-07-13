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
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">CO₂ Emissions Savings</h3>
      
      {data ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {data.emissionSaved.toFixed(2)} kg
              </div>
              <div className="text-sm text-gray-600">
                Total CO₂ emissions saved
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {data.relativeReduction.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">
                Emission reduction percentage
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Households Served:</span>
              <span className="font-medium">{data.numHouseholds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Individual Deliveries Emissions:</span>
              <span className="font-medium">{data.emissionIndividual.toFixed(2)} kg CO₂</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bulk Delivery Emissions:</span>
              <span className="font-medium">{data.emissionBulk.toFixed(2)} kg CO₂</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of Trucks:</span>
              <span className="font-medium">{data.numTrucks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Distance to Community:</span>
              <span className="font-medium">{data.bulkDistanceKm} km</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              By making bulk deliveries instead of individual trips, this order helps reduce carbon emissions equivalent to
              planting approximately {Math.ceil(data.emissionSaved / 22)} trees. 
              (A typical tree absorbs about 22kg of CO₂ per year)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
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
                className="w-full p-2 border rounded-md"
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
                className="w-full p-2 border rounded-md"
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
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
          >
            {loading ? 'Calculating...' : 'Calculate CO₂ Savings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CO2EmissionsSavingsCard;
