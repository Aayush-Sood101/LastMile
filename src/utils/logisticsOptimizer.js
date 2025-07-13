/**
 * Logistics and Carbon Emissions Optimizer for LastMile
 * 
 * This utility calculates truck requirements and carbon emissions savings for bulk deliveries.
 */

/**
 * Calculate the number of trucks required based on volume and weight constraints
 * @param {Array} quantities - Array of product quantities
 * @param {Array} volumePerUnit - Array of volumes per product (in m³)
 * @param {Array} weightPerUnit - Array of weights per product (in kg)
 * @param {Number} truckVolume - Volume capacity of one truck (in m³)
 * @param {Number} truckWeight - Weight capacity of one truck (in kg)
 * @returns {Number} Total number of trucks required
 */
export function calculateTrucksRequired(
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
 * @param {Object} params - Parameters for calculation
 * @param {Number} params.numHouseholds - Number of households in the community
 * @param {Number} params.indivDistanceKm - Average distance per household trip (km)
 * @param {Number} params.bulkDistanceKm - Distance from warehouse to community (km)
 * @param {Number} params.emissionIndiv - CO2 emission per km for individual delivery (kg)
 * @param {Number} params.emissionTruck - CO2 emission per km for truck (kg)
 * @param {Number} params.numTrucks - Number of trucks required for delivery
 * @returns {Object} Detailed emission savings report
 */
export function calculateCO2Savings({
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
 * Integrated discount optimization with logistics and carbon emissions
 * @param {Object} params - Parameters for optimization
 * @returns {Object} Optimized discounts and logistics details
 */
export function optimizeWithLogistics({
  supplierCosts,
  operationalCosts,
  retailPrices,
  quantities,
  volumePerUnit,
  weightPerUnit,
  targetMargin = 0.2,
  maxDiscount = 0.5,
  distanceKm = 10,
  costPerKm = 55,
  numHouseholds = 50
}) {
  // Calculate number of trucks required
  const numTrucks = calculateTrucksRequired(
    quantities,
    volumePerUnit,
    weightPerUnit
  );
  
  // Calculate transport cost
  const transportCost = numTrucks * costPerKm * distanceKm;
  
  // Define the margin constraint function
  const marginConstraint = (discounts) => {
    let sum = 0;
    
    for (let i = 0; i < discounts.length; i++) {
      const term = quantities[i] * ((1 - targetMargin) * retailPrices[i] * 
                                    (1 - discounts[i]) - supplierCosts[i] - operationalCosts[i]);
      sum += term;
    }
    
    // Include transport cost in constraint
    return sum - transportCost;
  };
  
  // Define objective function (maximize total weighted discount)
  const objective = (discounts) => {
    let sum = 0;
    for (let i = 0; i < discounts.length; i++) {
      sum += quantities[i] * discounts[i];
    }
    return sum;
  };
  
  // Logistic map for chaos
  const logisticMap = (c, mu = 4.0) => {
    return mu * c * (1 - c);
  };
  
  // Stage 1: Chaotic initialization
  const chaoticInitialization = (numIterations, numDimensions) => {
    let c = 0.7; // Initial chaotic value
    let bestDiscounts = null;
    let bestObjectiveValue = -Infinity;
    
    for (let k = 0; k < numIterations; k++) {
      c = logisticMap(c);
      
      // Create uniform discounts for all products
      const discounts = Array(numDimensions).fill(0 + (maxDiscount - 0) * c);
      
      // Check if margin constraint is satisfied
      if (marginConstraint(discounts) >= 0) {
        const objValue = objective(discounts);
        
        if (objValue > bestObjectiveValue) {
          bestObjectiveValue = objValue;
          bestDiscounts = [...discounts];
        }
      }
    }
    
    return bestDiscounts;
  };
  
  // Utility function to clamp values between bounds
  const clamp = (x, lower, upper) => {
    return Math.min(Math.max(x, lower), upper);
  };
  
  // Stage 2: Pattern search
  const patternSearch = (initialDiscounts, epsilon = 1e-4, maxIterations = 1000) => {
    const discounts = [...initialDiscounts];
    const n = discounts.length;
    const delta = Array(n).fill(0.05); // Initial step sizes
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let improved = false;
      const Y = [...discounts];
      
      for (let i = 0; i < n; i++) {
        const fBase = objective(Y);
        
        // Try positive direction
        const YPos = [...Y];
        YPos[i] = clamp(YPos[i] + delta[i], 0, maxDiscount);
        
        if (marginConstraint(YPos) >= 0 && objective(YPos) > fBase) {
          // Copy YPos to Y
          for (let j = 0; j < n; j++) {
            Y[j] = YPos[j];
          }
          improved = true;
          continue;
        }
        
        // Try negative direction
        const YNeg = [...Y];
        YNeg[i] = clamp(YNeg[i] - delta[i], 0, maxDiscount);
        
        if (marginConstraint(YNeg) >= 0 && objective(YNeg) > fBase) {
          // Copy YNeg to Y
          for (let j = 0; j < n; j++) {
            Y[j] = YNeg[j];
          }
          improved = true;
          continue;
        }
      }
      
      if (improved) {
        // Pattern move
        const XNew = Array(n);
        for (let i = 0; i < n; i++) {
          XNew[i] = clamp(2 * Y[i] - discounts[i], 0, maxDiscount);
        }
        
        if (marginConstraint(XNew) >= 0 && objective(XNew) > objective(Y)) {
          // Copy XNew to discounts
          for (let i = 0; i < n; i++) {
            discounts[i] = XNew[i];
          }
        } else {
          // Copy Y to discounts
          for (let i = 0; i < n; i++) {
            discounts[i] = Y[i];
          }
        }
      } else {
        // Reduce step sizes
        for (let i = 0; i < n; i++) {
          delta[i] /= 2;
        }
      }
      
      // Check for convergence
      const maxDelta = Math.max(...delta);
      if (maxDelta < epsilon) {
        break;
      }
    }
    
    return discounts;
  };
  
  // Main execution
  const numIterStage1 = 1000;
  const initialDiscounts = chaoticInitialization(numIterStage1, supplierCosts.length);
  
  if (!initialDiscounts) {
    return {
      success: false,
      message: "No feasible solution found in initialization stage"
    };
  }
  
  // Run pattern search
  const optimalDiscounts = patternSearch(initialDiscounts);
  
  // Calculate final results
  const finalPrices = retailPrices.map((p, i) => p * (1 - optimalDiscounts[i]));
  const profitPerProduct = finalPrices.map((p, i) => 
    (p - supplierCosts[i] - operationalCosts[i]) * quantities[i]
  );
  
  const totalProfit = profitPerProduct.reduce((sum, p) => sum + p, 0) - transportCost;
  const totalRevenue = finalPrices.reduce((sum, p, i) => sum + p * quantities[i], 0);
  const finalMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
  
  // Calculate CO2 savings
  const co2Savings = calculateCO2Savings({
    numHouseholds,
    bulkDistanceKm: distanceKm,
    numTrucks
  });
  
  // Prepare detailed results
  const productDetails = [];
  for (let i = 0; i < optimalDiscounts.length; i++) {
    productDetails.push({
      index: i,
      discount: optimalDiscounts[i],
      finalPrice: finalPrices[i],
      profit: profitPerProduct[i],
      quantity: quantities[i],
      volume: volumePerUnit[i],
      weight: weightPerUnit[i],
      supplierCost: supplierCosts[i],
      operationalCost: operationalCosts[i],
      retailPrice: retailPrices[i]
    });
  }
  
  return {
    success: true,
    optimization: {
      discounts: optimalDiscounts,
      finalPrices,
      profitPerProduct,
      totalProfit,
      totalRevenue,
      finalMargin,
      transportCost,
      productDetails
    },
    logistics: {
      numTrucks,
      distanceKm,
      costPerKm,
      totalTransportCost: transportCost
    },
    emissions: co2Savings
  };
}
