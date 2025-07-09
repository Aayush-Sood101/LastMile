import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Neighborhood Bulk Order Coordinator
              </h1>
              <p className="text-xl mb-8">
                Save money and reduce emissions with grouped deliveries in your neighborhood.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/register"
                  className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Sign Up Now
                </a>
                <a
                  href="/login"
                  className="bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Login
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Image
                src="/globe.svg"
                alt="Eco-friendly delivery"
                width={400}
                height={400}
                className="w-4/5 max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="mb-4 flex justify-center">
                <Image src="/file.svg" alt="Register" width={64} height={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Register</h3>
              <p className="text-gray-600">
                Create an account and join or create a community in your neighborhood.
              </p>
            </div>
            <div className="card text-center">
              <div className="mb-4 flex justify-center">
                <Image src="/window.svg" alt="Shop" width={64} height={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Shop</h3>
              <p className="text-gray-600">
                Browse products and add them to your cart with community discounts.
              </p>
            </div>
            <div className="card text-center">
              <div className="mb-4 flex justify-center">
                <Image src="/globe.svg" alt="Save" width={64} height={64} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save</h3>
              <p className="text-gray-600">
                Enjoy lower prices and reduced carbon footprint with grouped deliveries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Save Money",
                description:
                  "Get community discounts and reduce delivery fees by ordering together.",
              },
              {
                title: "Reduce Emissions",
                description:
                  "Help the environment by reducing the number of delivery trips to your area.",
              },
              {
                title: "Build Community",
                description:
                  "Connect with neighbors and work together for mutual benefits.",
              },
              {
                title: "Track Impact",
                description:
                  "See how much carbon footprint you've saved with your community orders.",
              },
            ].map((item, index) => (
              <div className="flex" key={index}>
                <div className="mr-4 text-green-600 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-700 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to save money and reduce your carbon footprint?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join our platform today and start coordinating bulk orders with your neighbors.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/register"
              className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign Up Now
            </a>
            <a
              href="/login"
              className="bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Neighborhood Bulk Order Coordinator</h3>
              <p className="text-gray-400">© 2025 All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <a href="/about" className="hover:text-blue-400">
                About
              </a>
              <a href="/contact" className="hover:text-blue-400">
                Contact
              </a>
              <a href="/privacy" className="hover:text-blue-400">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-blue-400">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
