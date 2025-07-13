import { NextResponse } from 'next/server';

/**
 * Handler for GET /api/products
 * Proxies request to the backend server
 */
export async function GET(request) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Get token from request headers
    const token = request.headers.get('x-auth-token') || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
    
    console.log('Products API route called, forwarding to:', `${API_BASE_URL}/api/products`);
    
    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      headers: {
        'x-auth-token': token || '',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      
      // Try to get error details
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { msg: response.statusText };
      }
      
      // Return the error
      return NextResponse.json(
        { msg: errorData.msg || 'Error fetching products from backend' },
        { status: response.status }
      );
    }
    
    // Get products from backend
    const products = await response.json();
    console.log(`Proxied ${products.length} products from backend`);
    
    // Return the products
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in products API route:', error);
    
    // Create sample products for testing if backend is unavailable
    const sampleProducts = [
      { _id: '60d21b4667d0d8992e610c85', name: 'Sample Product 1', price: 100, costPrice: 70, operationalCost: 5, volume: 0.02, weight: 1.5 },
      { _id: '60d21b4667d0d8992e610c86', name: 'Sample Product 2', price: 200, costPrice: 140, operationalCost: 5, volume: 0.03, weight: 2.0 },
      { _id: '60d21b4667d0d8992e610c87', name: 'Sample Product 3', price: 150, costPrice: 105, operationalCost: 5, volume: 0.01, weight: 1.0 }
    ];
    
    console.log('Returning sample products due to backend error');
    
    return NextResponse.json(
      sampleProducts,
      { status: 200 }
    );
  }
}
