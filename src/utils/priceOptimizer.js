/**
 * Price Optimization Module
 * 
 * This module uses numerical optimization to determine optimal discounts
 * for products while maintaining a target profit margin.
 */

class PriceOptimizer {
  /**
   * Optimize product discounts to maximize profit while maintaining target margin
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

    // Simple gradient descent algorithm to maximize profit while meeting margin constraint
    // In a real implementation, we'd use a more sophisticated optimization library
    
    // Start with no discounts
    let discounts = new Array(n).fill(0.05);
    let bestDiscounts = [...discounts];
    let bestProfit = this.calculateTotalProfit(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
    let bestMargin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
    
    const learningRate = 0.01;
    const iterations = 500;
    
    for (let i = 0; i < iterations; i++) {
      // Try adjusting each discount
      for (let j = 0; j < n; j++) {
        // Try increasing discount
        if (discounts[j] < maxDiscount) {
          discounts[j] += learningRate;
          
          const profit = this.calculateTotalProfit(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          const margin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          
          // If margin is above target and profit improved, keep the change
          if (margin >= targetMargin && profit > bestProfit) {
            bestDiscounts = [...discounts];
            bestProfit = profit;
            bestMargin = margin;
          } else {
            // Revert change
            discounts[j] -= learningRate;
          }
        }
        
        // Try decreasing discount
        if (discounts[j] > 0) {
          discounts[j] -= learningRate;
          
          const profit = this.calculateTotalProfit(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          const margin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          
          // If margin is above target and profit improved, keep the change
          if (margin >= targetMargin && profit > bestProfit) {
            bestDiscounts = [...discounts];
            bestProfit = profit;
            bestMargin = margin;
          } else {
            // Revert change
            discounts[j] += learningRate;
          }
        }
      }
    }
    
    // Calculate final results
    const finalPrices = maxRetailPrices.map((mrp, i) => mrp * (1 - bestDiscounts[i]));
    const finalProfits = finalPrices.map((p, i) => (p - supplierCosts[i] - operationalCosts[i]) * quantities[i]);
    const totalProfit = finalProfits.reduce((sum, p) => sum + p, 0);
    const totalRevenue = finalPrices.reduce((sum, p, i) => sum + p * quantities[i], 0);
    
    return {
      discounts: bestDiscounts.map(d => d * 100), // Convert to percentage
      prices: finalPrices,
      profitPerProduct: finalProfits,
      totalProfit,
      totalRevenue,
      margin: bestMargin * 100 // Convert to percentage
    };
  }
  
  /**
   * Calculate total profit based on given discounts
   */
  static calculateTotalProfit(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities) {
    return maxRetailPrices.reduce((total, mrp, i) => {
      const price = mrp * (1 - discounts[i]);
      const profit = (price - supplierCosts[i] - operationalCosts[i]) * quantities[i];
      return total + profit;
    }, 0);
  }
  
  /**
   * Calculate profit margin based on given discounts
   */
  static calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities) {
    let totalProfit = 0;
    let totalRevenue = 0;
    
    for (let i = 0; i < discounts.length; i++) {
      const price = maxRetailPrices[i] * (1 - discounts[i]);
      const profit = (price - supplierCosts[i] - operationalCosts[i]) * quantities[i];
      
      totalProfit += profit;
      totalRevenue += price * quantities[i];
    }
    
    return totalProfit / totalRevenue;
  }
}

export default PriceOptimizer;
