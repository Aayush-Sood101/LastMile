import PageHeader from '@/components/PageHeader';
import LogisticsOptimizer from '@/components/LogisticsOptimizer';

export const metadata = {
  title: 'Logistics Optimizer - LastMile',
  description: 'Optimize product discounts with logistics constraints and maximize CO₂ savings',
};

export default function LogisticsOptimizerPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <PageHeader 
        title="Logistics & Discount Optimizer" 
        description="Optimize discounts while considering logistics constraints and maximizing CO₂ savings"
      />
      <LogisticsOptimizer />
    </main>
  );
}
