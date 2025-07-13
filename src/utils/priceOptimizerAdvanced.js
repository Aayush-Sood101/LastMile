/**
 * Advanced Price Optimization Module
 * 
 * This module implements a two-stage optimization approach using:
 * 1. Chaotic initialization (based on logistic map)
 * 2. Pattern search refinement
 * 
 * The algorithm aims to maximize the total discount while maintaining a target profit margin.
 */

class PriceOptimizerAdvanced {
  /**
   * Generate chaotic value using logistic map
   * @param {number} c - Current chaotic value (0-1)
   * @param {number} mu - Control parameter (typically 4.0 for maximum chaos)
   * @returns {number} - Next chaotic value
   */
  static logisticMap(c, mu = 4.0) {
    return mu * c * (1 - c);
  }

  /**
   * Clamp value between lower and upper bounds
   * @param {number} value - Value to clamp
   * @param {number} lower - Lower bound
   * @param {number} upper - Upper bound
   * @returns {number} - Clamped value
   */
  static clamp(value, lower, upper) {
    return Math.min(Math.max(value, lower), upper);
  }

  /**
   * Calculate the profit margin constraint value
   * @param {Array<number>} discounts - Discount array
   * @param {Array<number>} supplierCosts - Supplier cost array
   * @param {Array<number>} operationalCosts - Operational cost array
   * @param {Array<number>} retailPrices - Retail price array
   * @param {Array<number>} quantities - Quantity array
   * @param {number} targetMargin - Target profit margin (0-1)
   * @returns {number} - Margin constraint value (≥ 0 means constraint is satisfied)
   */
  static marginConstraint(discounts, supplierCosts, operationalCosts, retailPrices, quantities, targetMargin) {
    let totalRevenue = 0;
    let totalCost = 0;
    
    for (let i = 0; i < discounts.length; i++) {
      const discountedPrice = retailPrices[i] * (1 - discounts[i]);
      totalRevenue += quantities[i] * discountedPrice;
      totalCost += quantities[i] * (supplierCosts[i] + operationalCosts[i]);
    }
    
    // Calculate current margin
    const totalProfit = totalRevenue - totalCost;
    const currentMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
    
    // Constraint is satisfied if current margin >= target margin
    // Return a positive value if constraint is satisfied
    return (currentMargin - targetMargin) * totalRevenue;
  }

  /**
   * Calculate the objective function value (total weighted discount)
   * @param {Array<number>} discounts - Discount array
   * @param {Array<number>} quantities - Quantity array
   * @returns {number} - Objective function value
   */
  static objective(discounts, quantities) {
    let sum = 0;
    
    for (let i = 0; i < discounts.length; i++) {
      sum += quantities[i] * discounts[i];
    }
    
    return sum;
  }

  /**
   * Stage I: Chaotic initialization to find a good starting point
   * @param {number} numIterations - Number of chaotic iterations
   * @param {number} numDimensions - Number of dimensions (products)
   * @param {number} lowerBound - Lower bound for discounts
   * @param {number} upperBound - Upper bound for discounts
   * @param {Array<number>} supplierCosts - Supplier cost array
   * @param {Array<number>} operationalCosts - Operational cost array
   * @param {Array<number>} retailPrices - Retail price array
   * @param {Array<number>} quantities - Quantity array
   * @param {number} targetMargin - Target profit margin (0-1)
   * @returns {Array<number>} - Initial discount array
   */
  static chaoticInitialization(
    numIterations, 
    numDimensions, 
    lowerBound, 
    upperBound,
    supplierCosts,
    operationalCosts,
    retailPrices,
    quantities,
    targetMargin
  ) {
    let c = 0.7; // Initial chaotic value (avoid fixed points)
    let bestDiscounts = null;
    let bestObjective = Number.NEGATIVE_INFINITY;
    
    // Use logistic map to create 1000 different chaotic discount patterns
    for (let k = 0; k < numIterations; k++) {
      c = this.logisticMap(c);
      
      // Create different discount for each product, not uniform
      const discounts = new Array(numDimensions).fill(0).map(() => {
        c = this.logisticMap(c);
        return lowerBound + (upperBound - lowerBound) * c;
      });
      
      // Check if constraints are satisfied
      const marginValue = this.marginConstraint(
        discounts, 
        supplierCosts, 
        operationalCosts, 
        retailPrices, 
        quantities, 
        targetMargin
      );
      
      if (marginValue >= 0) {
        const objectiveValue = this.objective(discounts, quantities);
        
        if (objectiveValue > bestObjective) {
          bestObjective = objectiveValue;
          bestDiscounts = [...discounts];
        }
      }
    }
    
    // If no feasible solution found, try with minimum discounts to see if we can find at least something
    if (!bestDiscounts) {
      console.log("No full-range solution found, trying with minimal discounts");
      // Try with very small discounts (1-5%)
      for (let attempt = 0; attempt < 100; attempt++) {
        const smallDiscounts = new Array(numDimensions).fill(0).map(() => 
          Math.random() * 0.05 // 0-5% discount
        );
        
        const marginValue = this.marginConstraint(
          smallDiscounts, 
          supplierCosts, 
          operationalCosts, 
          retailPrices, 
          quantities, 
          targetMargin
        );
        
        if (marginValue >= 0) {
          console.log("Found minimal discount solution");
          return smallDiscounts;
        }
      }
    }
    
    return bestDiscounts;
  }

  /**
   * Stage II: Pattern search refinement to improve the initial solution
   * @param {Array<number>} initialDiscounts - Initial discount array
   * @param {number} lowerBound - Lower bound for discounts
   * @param {number} upperBound - Upper bound for discounts
   * @param {Array<number>} supplierCosts - Supplier cost array
   * @param {Array<number>} operationalCosts - Operational cost array
   * @param {Array<number>} retailPrices - Retail price array
   * @param {Array<number>} quantities - Quantity array
   * @param {number} targetMargin - Target profit margin (0-1)
   * @param {number} epsilon - Convergence criteria
   * @param {number} maxIterations - Maximum number of iterations
   * @returns {Array<number>} - Optimized discount array
   */
  static patternSearch(
    initialDiscounts,
    lowerBound,
    upperBound,
    supplierCosts,
    operationalCosts,
    retailPrices,
    quantities,
    targetMargin,
    epsilon = 1e-4,
    maxIterations = 1000
  ) {
    // If no feasible initial solution found, return zeros
    if (!initialDiscounts) {
      console.warn("No feasible initial solution found, using no discounts");
      return new Array(supplierCosts.length).fill(0);
    }
    
    const currentDiscounts = [...initialDiscounts];
    const numDimensions = currentDiscounts.length;
    const stepSizes = new Array(numDimensions).fill(0.05); // Initial step sizes
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let improved = false;
      const trialDiscounts = [...currentDiscounts];
      
      for (let i = 0; i < numDimensions; i++) {
        const baseObjective = this.objective(trialDiscounts, quantities);
        
        // Try positive direction
        const positiveDiscounts = [...trialDiscounts];
        positiveDiscounts[i] = this.clamp(positiveDiscounts[i] + stepSizes[i], lowerBound, upperBound);
        
        const positiveMargin = this.marginConstraint(
          positiveDiscounts,
          supplierCosts,
          operationalCosts,
          retailPrices,
          quantities,
          targetMargin
        );
        
        if (positiveMargin >= 0) {
          const positiveObjective = this.objective(positiveDiscounts, quantities);
          
          if (positiveObjective > baseObjective) {
            trialDiscounts[i] = positiveDiscounts[i];
            improved = true;
            continue;
          }
        }
        
        // Try negative direction
        const negativeDiscounts = [...trialDiscounts];
        negativeDiscounts[i] = this.clamp(negativeDiscounts[i] - stepSizes[i], lowerBound, upperBound);
        
        const negativeMargin = this.marginConstraint(
          negativeDiscounts,
          supplierCosts,
          operationalCosts,
          retailPrices,
          quantities,
          targetMargin
        );
        
        if (negativeMargin >= 0) {
          const negativeObjective = this.objective(negativeDiscounts, quantities);
          
          if (negativeObjective > baseObjective) {
            trialDiscounts[i] = negativeDiscounts[i];
            improved = true;
            continue;
          }
        }
      }
      
      if (improved) {
        // Pattern move
        const newDiscounts = currentDiscounts.map((d, i) => {
          return this.clamp(2 * trialDiscounts[i] - d, lowerBound, upperBound);
        });
        
        const newMargin = this.marginConstraint(
          newDiscounts,
          supplierCosts,
          operationalCosts,
          retailPrices,
          quantities,
          targetMargin
        );
        
        if (newMargin >= 0) {
          const newObjective = this.objective(newDiscounts, quantities);
          const trialObjective = this.objective(trialDiscounts, quantities);
          
          if (newObjective > trialObjective) {
            for (let i = 0; i < numDimensions; i++) {
              currentDiscounts[i] = newDiscounts[i];
            }
          } else {
            for (let i = 0; i < numDimensions; i++) {
              currentDiscounts[i] = trialDiscounts[i];
            }
          }
        } else {
          for (let i = 0; i < numDimensions; i++) {
            currentDiscounts[i] = trialDiscounts[i];
          }
        }
      } else {
        // Reduce step sizes
        for (let i = 0; i < numDimensions; i++) {
          stepSizes[i] /= 2;
        }
      }
      
      // Check convergence
      const maxStepSize = Math.max(...stepSizes);
      if (maxStepSize < epsilon) {
        break;
      }
    }
    
    return currentDiscounts;
  }

  /**
   * Calculate vector norm (Euclidean)
   * @param {Array<number>} vector - Input vector
   * @returns {number} - Vector norm
   */
  static norm(vector) {
    return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  }

  /**
   * Main optimization function implementing the two-stage approach
   * @param {Object} options - Optimization parameters
   * @param {Array<number>} options.supplierCosts - Cost from suppliers for each product
   * @param {Array<number>} options.operationalCosts - Operational costs for each product
   * @param {Array<number>} options.maxRetailPrices - Maximum retail prices for each product
   * @param {Array<number>} options.quantities - Quantities demanded for each product
   * @param {number} options.targetMargin - Target profit margin as decimal (e.g., 0.2 for 20%)
   * @param {number} options.maxDiscount - Maximum allowed discount as decimal
   * @returns {Object} Optimization results
   */
  static optimizeDiscounts({
    supplierCosts,
    operationalCosts,
    maxRetailPrices,
    quantities,
    targetMargin = 0.2,
    maxDiscount = 0.5
  }) {
    // Input validation
    if (!Array.isArray(supplierCosts) || !Array.isArray(operationalCosts) || 
        !Array.isArray(maxRetailPrices) || !Array.isArray(quantities)) {
      throw new Error('All cost and quantity inputs must be arrays');
    }
    
    const n = supplierCosts.length;
    if ([operationalCosts.length, maxRetailPrices.length, quantities.length].some(len => len !== n)) {
      throw new Error('All input arrays must have the same length');
    }

    console.log('Advanced optimization inputs:', {
      targetMargin,
      maxDiscount,
      supplierCostsRange: [Math.min(...supplierCosts), Math.max(...supplierCosts)],
      operationalCostsRange: [Math.min(...operationalCosts), Math.max(...operationalCosts)],
      maxRetailPricesRange: [Math.min(...maxRetailPrices), Math.max(...maxRetailPrices)],
      quantitiesRange: [Math.min(...quantities), Math.max(...quantities)]
    });
    
    // Check if the business is profitable with zero discounts
    const zeroDiscounts = new Array(n).fill(0);
    const zeroMargin = this.marginConstraint(
      zeroDiscounts,
      supplierCosts,
      operationalCosts,
      maxRetailPrices,
      quantities,
      targetMargin
    );
    
    // If even zero discounts don't meet the margin, adjust the target margin to a feasible value
    let adjustedTargetMargin = targetMargin;
    if (zeroMargin < 0) {
      console.log("Warning: Target margin not feasible even with zero discounts, adjusting down");
      // Calculate the maximum achievable margin
      let totalRevenue = 0;
      let totalCost = 0;
      for (let i = 0; i < n; i++) {
        totalRevenue += quantities[i] * maxRetailPrices[i];
        totalCost += quantities[i] * (supplierCosts[i] + operationalCosts[i]);
      }
      
      const maxMargin = totalRevenue > 0 ? (totalRevenue - totalCost) / totalRevenue : 0;
      adjustedTargetMargin = Math.max(0, maxMargin * 0.9); // Set to 90% of maximum achievable
      console.log(`Adjusted target margin to ${(adjustedTargetMargin * 100).toFixed(2)}%`);
    }
    
    const lowerBound = 0.0;
    const upperBound = maxDiscount;
    
    // Stage I: Chaotic initialization
    console.log("Running Stage I: Chaotic Initialization...");
    const numIterations = 1000;
    const initialDiscounts = this.chaoticInitialization(
      numIterations, 
      n, 
      lowerBound, 
      upperBound,
      supplierCosts,
      operationalCosts,
      maxRetailPrices,
      quantities,
      adjustedTargetMargin
    );
    
    // If no feasible solution found, try a different approach with variable discounts
    if (!initialDiscounts) {
      console.log("No feasible solution found in Stage I, trying direct approach");
      // Calculate maximum possible discount for each product that maintains profitability
      const directDiscounts = maxRetailPrices.map((mrp, i) => {
        const supplierCost = supplierCosts[i];
        const opCost = operationalCosts[i];
        const totalCost = supplierCost + opCost;
        
        console.log(`Direct approach - Product ${i}:`);
        console.log(`  - Retail price: ${mrp.toFixed(2)}`);
        console.log(`  - Supplier cost: ${supplierCost.toFixed(2)}`);
        console.log(`  - Operational cost: ${opCost.toFixed(2)}`);
        console.log(`  - Total cost: ${totalCost.toFixed(2)}`);
        
        // The minimum price to achieve target margin
        const minPrice = totalCost / (1 - adjustedTargetMargin);
        console.log(`  - Min price for ${(adjustedTargetMargin * 100).toFixed(1)}% margin: ${minPrice.toFixed(2)}`);
        
        if (minPrice >= mrp) {
          console.log(`  - No discount possible (min price > retail price)`);
          return 0; // No discount possible
        }
        
        const maxPossibleDiscount = Math.max(0, 1 - (minPrice / mrp));
        // Apply a fraction of the maximum possible discount to be safe
        const safeDiscount = Math.min(maxDiscount, maxPossibleDiscount * 0.7);
        
        console.log(`  - Max possible discount: ${(maxPossibleDiscount * 100).toFixed(2)}%`);
        console.log(`  - Safe discount applied: ${(safeDiscount * 100).toFixed(2)}%`);
        
        return safeDiscount;
      });
      
      // Check if this solution is feasible
      const directMargin = this.marginConstraint(
        directDiscounts,
        supplierCosts,
        operationalCosts,
        maxRetailPrices,
        quantities,
        adjustedTargetMargin
      );
      
      if (directMargin >= 0) {
        console.log("Direct approach found a feasible solution");
        // Calculate final results with direct discounts
        const finalPrices = maxRetailPrices.map((mrp, i) => mrp * (1 - directDiscounts[i]));
        const finalProfits = finalPrices.map((p, i) => (p - supplierCosts[i] - operationalCosts[i]) * quantities[i]);
        const totalProfit = finalProfits.reduce((sum, p) => sum + p, 0);
        const totalRevenue = finalPrices.reduce((sum, p, i) => sum + p * quantities[i], 0);
        const finalMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
        
        return {
          discounts: directDiscounts.map(d => d * 100), // Convert to percentage
          prices: finalPrices,
          profitPerProduct: finalProfits,
          totalProfit,
          totalRevenue,
          margin: finalMargin * 100 // Convert to percentage
        };
      }
      
      // If direct approach also fails, return minimal discounts
      console.log("No feasible solution found, using minimal discounts");
      // Apply small discounts to high-margin products only
      const minimalDiscounts = maxRetailPrices.map((mrp, i) => {
        const cost = supplierCosts[i] + operationalCosts[i];
        const currentMargin = (mrp - cost) / mrp;
        console.log(`Product ${i}: Price ${mrp.toFixed(2)}, Cost ${cost.toFixed(2)} (${supplierCosts[i].toFixed(2)} + ${operationalCosts[i].toFixed(2)}), Margin ${(currentMargin * 100).toFixed(2)}%`);
        
        // Only apply discounts to products with margin > target + 10%
        const shouldDiscount = (currentMargin > (adjustedTargetMargin + 0.1));
        console.log(`  -> ${shouldDiscount ? "Apply discount" : "No discount"}`);
        return shouldDiscount ? 0.05 : 0;
      });
      
      const finalPrices = maxRetailPrices.map((mrp, i) => mrp * (1 - minimalDiscounts[i]));
      const finalProfits = finalPrices.map((p, i) => (p - supplierCosts[i] - operationalCosts[i]) * quantities[i]);
      const totalProfit = finalProfits.reduce((sum, p) => sum + p, 0);
      const totalRevenue = finalPrices.reduce((sum, p, i) => sum + p * quantities[i], 0);
      const finalMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
      
      return {
        discounts: minimalDiscounts.map(d => d * 100), // Convert to percentage
        prices: finalPrices,
        profitPerProduct: finalProfits,
        totalProfit,
        totalRevenue,
        margin: finalMargin * 100 // Convert to percentage
      };
    }
    
    console.log("Stage I best discount guess:", initialDiscounts);
    
    // Stage II: Pattern search refinement
    console.log("Running Stage II: Pattern Search Refinement...");
    const optimizedDiscounts = this.patternSearch(
      initialDiscounts,
      lowerBound,
      upperBound,
      supplierCosts,
      operationalCosts,
      maxRetailPrices,
      quantities,
      adjustedTargetMargin
    );
    
    console.log("Optimized discounts:", optimizedDiscounts);
    
    // Calculate final results
    const finalPrices = maxRetailPrices.map((mrp, i) => mrp * (1 - optimizedDiscounts[i]));
    const finalProfits = finalPrices.map((p, i) => (p - supplierCosts[i] - operationalCosts[i]) * quantities[i]);
    const totalProfit = finalProfits.reduce((sum, p) => sum + p, 0);
    const totalRevenue = finalPrices.reduce((sum, p, i) => sum + p * quantities[i], 0);
    const finalMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
    
    // Create detailed output
    const results = {
      discounts: optimizedDiscounts.map(d => d * 100), // Convert to percentage
      prices: finalPrices,
      profitPerProduct: finalProfits,
      totalProfit,
      totalRevenue,
      margin: finalMargin * 100 // Convert to percentage
    };
    
    console.log("===== Detailed Results =====");
    for (let i = 0; i < n; i++) {
      console.log(`Product ${i+1}:`);
      console.log(`  Discount: ${results.discounts[i].toFixed(2)}%`);
      console.log(`  Final Price per unit: ₹${finalPrices[i].toFixed(2)}`);
      console.log(`  Profit per product: ₹${finalProfits[i].toFixed(2)}`);
      console.log(`  Quantity ordered: ${quantities[i]}`);
    }
    console.log(`\nTotal Profit: ₹${totalProfit.toFixed(2)}`);
    console.log(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    console.log(`Final Overall Profit Margin: ${(finalMargin*100).toFixed(2)}%`);
    
    return results;
  }
}

export default PriceOptimizerAdvanced;
