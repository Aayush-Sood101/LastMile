'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { communityService } from '@/services/api';

export default function CreateCommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    type: 'apartment',
    expectedSize: '',
    motive: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Authentication Required</h2>
          <p className="text-gray-600 mb-6 text-center">
            Please log in or register to create a community.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/login?redirect=/communities/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register?redirect=/communities/create')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-md"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.name.trim()) return 'Community name is required';
      if (!formData.description.trim()) return 'Description is required';
      if (formData.description.trim().length < 20) return 'Description should be at least 20 characters';
    } else if (step === 2) {
      if (!formData.location.street.trim()) return 'Street address is required';
      if (!formData.location.city.trim()) return 'City is required';
      if (!formData.location.state.trim()) return 'State is required';
      if (!formData.location.zipCode.trim()) return 'ZIP code is required';
    }
    return null;
  };
  
  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      setError(error);
      return;
    }
    
    setError(null);
    setStep(prev => prev + 1);
  };
  
  const handlePrevious = () => {
    setError(null);
    setStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateStep(step);
    if (error) {
      setError(error);
      return;
    }
    
    if (!formData.expectedSize) {
      setError('Expected community size is required');
      return;
    }
    
    if (!formData.motive.trim()) {
      setError('Motive for creating the community is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await communityService.createCommunity({
        ...formData,
        admin: user._id
      });
      
      // Redirect to thank you/confirmation page
      router.push('/communities/confirmation');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
      console.error('Community creation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Create a Community</h1>
          
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <p className="text-sm mt-1">Details</p>
              </div>
              
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <p className="text-sm mt-1">Location</p>
              </div>
              
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <p className="text-sm mt-1">Verification</p>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Community Details */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Maple Ridge Apartments"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your community and its needs..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 20 characters. Explain why you want to create this community.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
                    Community Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="apartment">Apartment Complex</option>
                    <option value="dorm">Dormitory/Hostel</option>
                    <option value="neighborhood">Neighborhood</option>
                    <option value="office">Office Building</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Location Information */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <label htmlFor="location.street" className="block text-gray-700 font-medium mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="location.street"
                    name="location.street"
                    value={formData.location.street}
                    onChange={handleChange}
                    placeholder="123 Main St"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="location.city" className="block text-gray-700 font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="location.city"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location.state" className="block text-gray-700 font-medium mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      id="location.state"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="location.zipCode" className="block text-gray-700 font-medium mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="location.zipCode"
                      name="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleChange}
                      placeholder="ZIP Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location.country" className="block text-gray-700 font-medium mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      id="location.country"
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      placeholder="Country"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="text-gray-600 hover:text-gray-800 py-2 px-6"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Verification */}
            {step === 3 && (
              <div>
                <div className="mb-6">
                  <label htmlFor="expectedSize" className="block text-gray-700 font-medium mb-2">
                    Expected Community Size *
                  </label>
                  <select
                    id="expectedSize"
                    name="expectedSize"
                    value={formData.expectedSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select size...</option>
                    <option value="small">Small (5-20 members)</option>
                    <option value="medium">Medium (21-50 members)</option>
                    <option value="large">Large (51-100 members)</option>
                    <option value="xlarge">Very Large (100+ members)</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="motive" className="block text-gray-700 font-medium mb-2">
                    Motive for Creating Community *
                  </label>
                  <textarea
                    id="motive"
                    name="motive"
                    value={formData.motive}
                    onChange={handleChange}
                    placeholder="Explain why you want to create this community and how it will benefit members..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">
                    This information will be reviewed by Walmart when approving your community.
                  </p>
                </div>
                
                <div className="mb-8 bg-blue-50 p-4 rounded-md">
                  <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                  <p className="text-blue-700 text-sm">
                    After submission, your community request will be reviewed by Walmart.
                    This typically takes 1-3 business days. You will be notified by email
                    when your community is approved.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="text-gray-600 hover:text-gray-800 py-2 px-6"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
          
          {/* Info box */}
          <div className="mt-8 bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Community Guidelines</h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Communities must be real physical locations where members live or work.</li>
              <li>You must be authorized to create a community for your location.</li>
              <li>Communities must have at least 5 potential members.</li>
              <li>Community administrators are responsible for managing member requests.</li>
              <li>Walmart has final approval authority for all communities.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
