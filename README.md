# Neighborhood Bulk Order Coordinator - Frontend

This is the frontend application for the Neighborhood Bulk Order Coordinator, which allows neighbors to opt into grouped deliveries to save money and reduce emissions.

## Project Overview

The Neighborhood Bulk Order Coordinator aims to solve the problem of costly and repetitive last-mile deliveries by allowing neighbors to coordinate bulk orders, especially in apartments or hostels.

## Features

- User authentication (login/signup)
- User dashboard with product browsing and filtering
- Shopping cart functionality and checkout
- Community creation and management
- Join requests and membership management
- Order placement and tracking
- Detailed carbon footprint visualization
- Admin dashboard for Walmart
- Community admin dashboard

## Tech Stack

- Next.js 15.3.5
- React 19.0.0
- Tailwind CSS 4.1.11
- Axios for API calls
- Chart.js for data visualization
- React Icons

## Project Structure

```
frontend/
├── public/            # Static files
├── src/
│   ├── app/           # Next.js app directory
│   │   ├── auth/      # Authentication pages
│   │   │   ├── login/     # Login page
│   │   │   └── register/  # Registration page
│   │   ├── dashboard/ # User dashboard with products
│   │   ├── cart/      # Shopping cart
│   │   ├── communities/ # Community management
│   │   ├── account/   # User account and profile
│   │   ├── admin/     # Walmart admin portal
│   │   │   └── dashboard/ # Admin dashboard
│   │   └── ...        # Other pages
│   └── components/    # Reusable React components
```

## User Types

1. **Regular User**:
   - Can register/login
   - Browse products and add to cart
   - Join existing communities
   - Place individual or community orders
   - Track personal carbon savings

2. **Community Admin**:
   - Create communities (requires Walmart approval)
   - Approve/reject community join requests
   - Manage community members
   - View community order history
   - Track community carbon savings

3. **Walmart Admin**:
   - Dashboard with aggregate statistics
   - Approve/reject community creation requests
   - View all orders and track revenue
   - Monitor overall carbon footprint reduction

## Getting Started

### Prerequisites

- Node.js (v16+)
- Backend server running (see backend README.md)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## User Flows

1. **User Registration/Login**
   - Users can register with their email, name, and address
   - Users can log in to access their dashboard

2. **Product Browsing and Shopping**
   - Users can browse all products with search and filter
   - Users can add products to cart and adjust quantities
   - Users can checkout to create orders

3. **Community Management**
   - Users can create communities (requires Walmart approval)
   - Users can request to join existing communities
   - Community admins can approve/reject join requests
   - Members receive discounts on their orders

4. **Order Processing**
   - Orders are processed with community discounts
   - Users can view order history
   - Carbon footprint is calculated for each order
   
5. **Walmart Admin**
   - Dashboard shows total carbon saved and order statistics
   - Approve/reject community creation requests
   - View all orders and community data

## Integration with Backend

This frontend connects to the backend API at `http://localhost:5000`. Make sure the backend server is running before using the frontend.

## License

This project is licensed under the ISC License.

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
