'use client';

import PriceOptimizerAdvanced from '@/utils/priceOptimizerAdvanced';

// Sample data from the Python example
const supplierCosts = [40, 30, 80];
const operationalCosts = [5, 4, 6];
const retailPrices = [60, 50, 120];
const quantities = [17722674, 30556467, 200365476574];
const targetMargin = 0.2; // 20%
const maxDiscount = 0.5; // 50%

export default function TestOptimizer() {
  const handleTestOptimization = () => {
    console.log("Running advanced optimization test...");
    
    const result = PriceOptimizerAdvanced.optimizeDiscounts({
      supplierCosts,
      operationalCosts,
      maxRetailPrices: retailPrices,
      quantities,
      targetMargin,
      maxDiscount
    });
    
    console.log("Optimization complete:", result);
    alert(`Optimization complete!\n\nTotal Profit: ₹${result.totalProfit.toFixed(2)}\nMargin: ${result.margin.toFixed(2)}%`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Advanced Price Optimizer Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
        
        <div className="mb-4">
          <h3 className="font-medium">Sample Data:</h3>
          <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
            {`
// Product data
supplierCosts = [40, 30, 80]
operationalCosts = [5, 4, 6]
retailPrices = [60, 50, 120]
quantities = [17722674, 30556467, 200365476574]

// Constraints
targetMargin = 0.2 (20%)
maxDiscount = 0.5 (50%)
            `}
          </pre>
        </div>
        
        <button
          onClick={handleTestOptimization}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
        >
          Run Optimization Test
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Expected Result</h2>
        
        <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
          {`
Optimized discounts per product:
  Product 1: 50.00% discount
  Product 2: 50.00% discount
  Product 3: 10.40% discount

Total weighted discount: 20868471959.10
Profit margin constraint value: 1798889741.96

===== Detailed Results =====
Product 1:
  Discount: 50.00%
  Final Price per unit: ₹30.00
  Profit per product: ₹-265840110.00
  Quantity ordered: 17722674.0
Product 2:
  Discount: 50.00%
  Final Price per unit: ₹25.00
  Profit per product: ₹-275008203.00
  Quantity ordered: 30556467.0
Product 3:
  Discount: 10.40%
  Final Price per unit: ₹107.52
  Profit per product: ₹4311106316883.45
  Quantity ordered: 200365476574.0

Total Profit: ₹4310565468570.45
Total Revenue: ₹21543832894142.45
Final Overall Profit Margin: 20.01%
          `}
        </pre>
      </div>
    </div>
  );
}
