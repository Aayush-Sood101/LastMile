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

    console.log("Starting optimization with:");
    console.log("- Supplier costs:", supplierCosts);
    console.log("- Operational costs:", operationalCosts);
    console.log("- Retail prices:", maxRetailPrices);
    console.log("- Target margin:", targetMargin);

    // First, check which products are actually profitable before optimization
    const productProfitability = maxRetailPrices.map((price, i) => {
      const totalCost = supplierCosts[i] + operationalCosts[i];
      const currentMargin = (price - totalCost) / price;
      
      return {
        index: i,
        price: price,
        supplierCost: supplierCosts[i],
        operationalCost: operationalCosts[i],
        totalCost: totalCost,
        currentMargin: currentMargin,
        profitable: price > totalCost
      };
    });
    
    console.log("Product profitability analysis:", productProfitability);
    
    // Count profitable products
    const profitableProducts = productProfitability.filter(p => p.profitable);
    if (profitableProducts.length === 0) {
      console.warn("No profitable products found. Cannot optimize.");
      return {
        discounts: new Array(n).fill(0),
        prices: [...maxRetailPrices],
        profitPerProduct: maxRetailPrices.map((p, i) => (p - supplierCosts[i] - operationalCosts[i]) * quantities[i]),
        totalProfit: this.calculateTotalProfit(new Array(n).fill(0), supplierCosts, operationalCosts, maxRetailPrices, quantities),
        totalRevenue: maxRetailPrices.reduce((sum, p, i) => sum + p * quantities[i], 0),
        margin: 0
      };
    }

    // Start with intelligent initial discounts - higher margins get higher discounts
    let discounts = productProfitability.map(p => {
      if (!p.profitable) return 0; // No discount for unprofitable products
      
      // Only apply discounts to products with sufficient margin
      if (p.currentMargin < targetMargin * 1.2) {
        // Products near or below target margin get no discount
        return 0;
      }
      
      // Scale discount by profitability, max 20% of possible discount for initial value
      // The higher the margin compared to target, the more discount we can apply
      const marginRatio = p.currentMargin / targetMargin;
      const initialDiscount = Math.min(
        maxDiscount * 0.2,
        p.currentMargin * 0.3 * (marginRatio - 1)
      );
      
      console.log(`Product ${p.index}: margin ${p.currentMargin.toFixed(2)}, initial discount ${initialDiscount.toFixed(2)}`);
      return initialDiscount;
    });
    
    let bestDiscounts = [...discounts];
    let bestProfit = this.calculateTotalProfit(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
    let bestMargin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
    
    const learningRate = 0.01;
    const iterations = 1000; // Increased iteration count
    
    // If initial margin is below target, adjust prices up first
    const initialMargin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
    if (initialMargin < targetMargin) {
      // Reduce discounts on least profitable items first to improve margin
      const productsByMargin = [...productProfitability].sort((a, b) => a.margin - b.margin);
      
      for (const product of productsByMargin) {
        if (discounts[product.index] > 0) {
          discounts[product.index] = 0; // Remove discount from this product
          
          const newMargin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          if (newMargin >= targetMargin) {
            break; // We've reached the target margin
          }
        }
      }
      
      // Update best values after initial adjustment
      bestDiscounts = [...discounts];
      bestProfit = this.calculateTotalProfit(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
      bestMargin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
    }
    
    // Main optimization loop
    for (let i = 0; i < iterations; i++) {
      // Try adjusting each discount
      for (let j = 0; j < n; j++) {
        // Skip unprofitable products
        if (!productProfitability[j].profitable) continue;
        
        // Try increasing discount for profitable products
        if (discounts[j] < maxDiscount) {
          discounts[j] += learningRate;
          
          const profit = this.calculateTotalProfit(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          const margin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          
          // If margin is above target and profit is reasonable, keep the change
          if (margin >= targetMargin && profit > 0) {
            bestDiscounts = [...discounts];
            bestProfit = profit;
            bestMargin = margin;
          } else {
            // Revert change
            discounts[j] -= learningRate;
          }
        }
        
        // Try decreasing discount (to improve profit)
        if (discounts[j] > 0) {
          discounts[j] -= learningRate;
          
          const profit = this.calculateTotalProfit(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          const margin = this.calculateMargin(discounts, supplierCosts, operationalCosts, maxRetailPrices, quantities);
          
          // If profit improved while maintaining margin, keep the change
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
      
      // Adjust learning rate to fine-tune solution
      if (i > iterations/2) {
        // Reduce learning rate in later iterations
        learningRate *= 0.99;
      }
    }
    
    // Ensure we don't have negative profits per product in the final solution
    for (let i = 0; i < n; i++) {
      const price = maxRetailPrices[i] * (1 - bestDiscounts[i]);
      const totalCost = supplierCosts[i] + operationalCosts[i];
      
      // Calculate unit profit margin
      const unitProfit = price - totalCost;
      const unitProfitMargin = price > 0 ? unitProfit / price : 0;
      
      console.log(`Product ${i}: Final price ${price.toFixed(2)}, cost ${totalCost.toFixed(2)}, profit ${unitProfit.toFixed(2)}`);
      
      // If a product has negative or insufficient profit, adjust discount to maintain minimal profitability
      if (unitProfit <= 0 || unitProfitMargin < targetMargin * 0.5) {
        // Remove discount completely
        bestDiscounts[i] = 0;
        console.log(`  -> Removed discount for product ${i} due to negative/insufficient profit`);
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
