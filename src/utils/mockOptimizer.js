'use client';

/**
 * Mock implementation of logistics optimization algorithm for frontend fallback
 * Use only when backend API is unavailable
 */

/**
 * Calculate the number of trucks required based on volume and weight constraints
 */
function calculateTrucksRequired(
  quantities, 
  volumePerUnit, 
  weightPerUnit, 
  truckVolume = 15.0, 
  truckWeight = 3000.0
) {
  // Calculate total volume and weight
  let totalVolume = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < quantities.length; i++) {
    totalVolume += quantities[i] * volumePerUnit[i];
    totalWeight += quantities[i] * weightPerUnit[i];
  }
  
  // Calculate trucks needed by volume and weight
  const trucksByVolume = Math.ceil(totalVolume / truckVolume);
  const trucksByWeight = Math.ceil(totalWeight / truckWeight);
  
  // Return the maximum of the two
  return Math.max(trucksByVolume, trucksByWeight);
}

/**
 * Calculate CO2 emission savings from bulk delivery vs individual deliveries
 */
function calculateCO2Savings({
  numHouseholds = 50,
  indivDistanceKm = 4,     // avg per household trip
  bulkDistanceKm = 10,     // warehouse to community
  emissionIndiv = 0.18,    // kg CO2/km (bike/scooter)
  emissionTruck = 0.55,    // kg CO2/km (truck)
  numTrucks = 1
}) {
  // Calculate CO2 for individual deliveries
  const emissionIndividual = numHouseholds * indivDistanceKm * emissionIndiv;
  
  // Calculate CO2 for bulk delivery
  const emissionBulk = numTrucks * bulkDistanceKm * emissionTruck;
  
  // Calculate saved emissions
  const emissionSaved = emissionIndividual - emissionBulk;
  const relativeReduction = (emissionSaved / emissionIndividual) * 100;
  
  // Return detailed results
  return {
    numHouseholds,
    emissionIndividual,
    emissionBulk,
    emissionSaved,
    relativeReduction,
    numTrucks,
    indivDistanceKm,
    bulkDistanceKm
  };
}

/**
 * Calculate discounts that satisfy the margin constraint
 */
export function mockOptimizeDiscounts(params) {
  // Extract parameters
  const {
    productIds,
    quantities,
    volumePerUnit,
    weightPerUnit,
    targetMargin = 0.2,
    maxDiscount = 0.5,
    distanceKm = 10,
    costPerKm = 55,
    numHouseholds = 50
  } = params;
  
  // Create mock products since we can't fetch from database
  const mockProducts = productIds.map((id, i) => {
    // Assume retail price is around 1.5x cost price as a baseline
    const costPrice = 100; // Arbitrary cost price
    return {
      _id: id,
      name: `Product ${i+1}`,
      price: costPrice * 1.5,
      costPrice: costPrice,
      operationalCost: 5
    };
  });
  
  // Prepare data for optimization
  const supplierCosts = mockProducts.map(p => p.costPrice);
  const operationalCosts = mockProducts.map(p => p.operationalCost);
  const retailPrices = mockProducts.map(p => p.price);
  
  // Calculate trucks required
  const numTrucks = calculateTrucksRequired(
    quantities,
    volumePerUnit,
    weightPerUnit
  );
  
  // Calculate transport cost
  const transportCost = numTrucks * costPerKm * distanceKm;
  
  // Simple optimization algorithm: assign uniform discounts
  // Start with zero discounts and increase until margin constraint is violated
  let optimalDiscounts = Array(productIds.length).fill(0);
  const discountStep = 0.01;
  
  // Calculate margin with current discounts
  const calculateMargin = (discounts) => {
    const finalPrices = retailPrices.map((p, i) => p * (1 - discounts[i]));
    const totalRevenue = finalPrices.reduce((sum, p, i) => sum + p * quantities[i], 0);
    const totalCost = supplierCosts.reduce((sum, c, i) => sum + c * quantities[i], 0) + 
                     operationalCosts.reduce((sum, c, i) => sum + c * quantities[i], 0) + 
                     transportCost;
    
    const profit = totalRevenue - totalCost;
    return totalRevenue > 0 ? profit / totalRevenue : -1;
  };
  
  // Increase discounts uniformly until we hit the target margin
  let currentDiscount = 0;
  while (currentDiscount <= maxDiscount) {
    const discounts = Array(productIds.length).fill(currentDiscount);
    const margin = calculateMargin(discounts);
    
    if (margin < targetMargin) {
      // We've gone too far, step back
      break;
    }
    
    optimalDiscounts = discounts;
    currentDiscount += discountStep;
  }
  
  // Apply some randomization to make it more realistic
  optimalDiscounts = optimalDiscounts.map(d => {
    // Random adjustment between -0.05 and +0.05, but not below 0 or above maxDiscount
    const adjustment = -0.05 + (Math.random() * 0.1);
    return Math.max(0, Math.min(maxDiscount, d + adjustment));
  });
  
  // Calculate final prices and profits
  const finalPrices = retailPrices.map((p, i) => p * (1 - optimalDiscounts[i]));
  const finalProfits = finalPrices.map((p, i) => 
    (p - supplierCosts[i] - operationalCosts[i]) * quantities[i]
  );
  const totalProfit = finalProfits.reduce((sum, p) => sum + p, 0);
  const totalRevenue = finalPrices.reduce((sum, p, i) => sum + p * quantities[i], 0);
  const finalMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
  
  // Calculate CO2 savings
  const emissions = calculateCO2Savings({
    numHouseholds,
    bulkDistanceKm: distanceKm,
    numTrucks
  });
  
  // Map results back to product information
  const productDetails = mockProducts.map((product, i) => ({
    id: product._id,
    name: product.name,
    retailPrice: retailPrices[i],
    supplierCost: supplierCosts[i],
    operationalCost: operationalCosts[i],
    discount: optimalDiscounts[i],
    finalPrice: finalPrices[i],
    quantity: quantities[i],
    profit: finalProfits[i]
  }));
  
  // Prepare response
  return {
    success: true,
    optimization: {
      productDetails,
      totalRevenue,
      totalProfit,
      finalMargin,
      transportCost,
      targetMargin,
      maxDiscount
    },
    logistics: {
      numTrucks,
      distanceKm,
      costPerKm,
      totalTransportCost: transportCost,
      totalVolume: quantities.reduce((sum, q, i) => sum + q * volumePerUnit[i], 0),
      totalWeight: quantities.reduce((sum, q, i) => sum + q * weightPerUnit[i], 0)
    },
    emissions,
    isMockData: true
  };
}
