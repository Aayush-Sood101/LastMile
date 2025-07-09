# Neighborhood Bulk Order Coordinator - Frontend

This is the frontend application for the Neighborhood Bulk Order Coordinator, which allows neighbors to opt into grouped deliveries to save money and reduce emissions.

## Project Overview

The Neighborhood Bulk Order Coordinator aims to solve the problem of costly and repetitive last-mile deliveries by allowing neighbors to coordinate bulk orders, especially in apartments or hostels.

## Features

- User authentication (login/signup)
- User dashboard
- Product browsing and shopping
- Community management
- Order placement and tracking
- Carbon footprint visualization
- Admin dashboard for Walmart
- Community admin dashboard

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Axios for API calls
- Chart.js for data visualization

## Project Structure

```
frontend/
├── public/            # Static files
├── src/
│   ├── app/           # Next.js app directory
│   │   ├── login/     # Login page
│   │   ├── register/  # Registration page
│   │   ├── dashboard/ # User dashboard
│   │   ├── admin/     # Walmart admin portal
│   │   └── ...        # Other pages
│   ├── components/    # Reusable React components
│   ├── context/       # React context for state management
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   └── utils/         # Helper utilities
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory
   ```bash
   cd frontend
   ```
3. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Running in Production

```bash
npm start
# or
yarn start
```

## User Flows

1. **User Registration/Login**
   - Users can register with their information
   - Users can log in to access their dashboard

2. **Community Management**
   - Users can create a new community as an admin
   - Users can apply to join existing communities
   - Community admins can approve/reject join requests

3. **Shopping Experience**
   - Browse products with pricing information
   - View community discounts if part of a community
   - Add products to cart and checkout

4. **Order Management**
   - Place individual or community orders
   - Track order status
   - View order history

5. **Carbon Footprint Tracking**
   - View carbon footprint saved through community orders
   - See community-wide environmental impact

## Walmart Admin Portal

The admin portal allows Walmart administrators to:
- Approve/reject new community requests
- View overall carbon footprint savings
- Monitor community activities
- Access analytics and reports

## License

This project is licensed under the ISC License.
