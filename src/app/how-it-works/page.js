export default function HowItWorks() {
  return (
    <main className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-12">How NeighborBulk Works</h1>
        
        {/* Main Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-6 mx-auto">
              1
            </div>
            <h2 className="text-2xl font-semibold text-center mb-4">Join or Create a Community</h2>
            <p className="text-gray-600 text-center">
              Find a community in your neighborhood or start your own. Communities are groups of neighbors who place bulk orders together.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-6 mx-auto">
              2
            </div>
            <h2 className="text-2xl font-semibold text-center mb-4">Add Products to Community Cart</h2>
            <p className="text-gray-600 text-center">
              Browse products and add them to your community cart. See what your neighbors are ordering and benefit from bulk discounts.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-6 mx-auto">
              3
            </div>
            <h2 className="text-2xl font-semibold text-center mb-4">Receive Consolidated Delivery</h2>
            <p className="text-gray-600 text-center">
              Your community admin coordinates with Walmart for a single delivery to your community, reducing emissions and saving you money.
            </p>
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Benefits of NeighborBulk</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="mr-2 text-green-500">💰</span>
                Save Money
              </h3>
              <p className="text-gray-600">
                Enjoy community bulk discounts on your favorite products. The more your community orders together, the more everyone saves.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="mr-2 text-green-500">🌍</span>
                Reduce Carbon Footprint
              </h3>
              <p className="text-gray-600">
                By consolidating multiple deliveries into one, we significantly reduce the carbon emissions from last-mile delivery.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="mr-2 text-green-500">👥</span>
                Build Community
              </h3>
              <p className="text-gray-600">
                Connect with your neighbors and build stronger community ties while coordinating shopping needs together.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="mr-2 text-green-500">⏱️</span>
                Save Time
              </h3>
              <p className="text-gray-600">
                Spend less time shopping and tracking deliveries with our coordinated delivery system. One delivery for everyone!
              </p>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">How do I join a community?</h3>
              <p className="text-gray-600">
                Browse available communities in your area and submit a request to join. The community admin will review and approve your request.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">How do I create a new community?</h3>
              <p className="text-gray-600">
                Click on "Create Community" in the Communities page, fill out the required information, and submit. Once approved by Walmart, you'll be the admin of your new community.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">How often are deliveries made?</h3>
              <p className="text-gray-600">
                Delivery cycles are typically scheduled weekly or bi-weekly, depending on the community's needs and Walmart's delivery schedule.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">What happens if I miss a delivery cycle?</h3>
              <p className="text-gray-600">
                If your community cart is not finalized before the delivery cycle deadline, your items will be moved to the next scheduled delivery cycle.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">How are the discounts calculated?</h3>
              <p className="text-gray-600">
                Community discounts are applied based on the total volume of orders in your community cart. The more items ordered collectively, the higher the discount percentage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
