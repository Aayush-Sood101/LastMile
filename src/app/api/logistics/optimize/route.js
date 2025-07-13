import { NextResponse } from 'next/server';

/**
 * Handler for POST /api/logistics/optimize
 * Proxies request to the backend server
 */
export async function POST(request) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Get token from request headers
    const token = request.headers.get('x-auth-token') || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
    
    // Parse request body
    const requestData = await request.json();
    
    console.log('Logistics optimize API route called, forwarding to:', `${API_BASE_URL}/api/logistics/optimize`);
    console.log('Request data:', JSON.stringify(requestData));
    
    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/api/logistics/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token || '',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(requestData),
      cache: 'no-store'
    });
    
    // Try to get response data
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { msg: 'Could not parse response from backend' };
    }
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText, responseData);
      
      // Return the error
      return NextResponse.json(
        responseData,
        { status: response.status }
      );
    }
    
    console.log('Optimization successful');
    
    // Return the optimization result
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in logistics optimize API route:', error);
    
    // Return error
    return NextResponse.json(
      { msg: error.message || 'Error running optimization' },
      { status: 500 }
    );
  }
}
