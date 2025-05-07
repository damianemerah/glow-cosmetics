# Glow Cosmetics

A modern, full-stack beauty and wellness booking platform built with Next.js and Supabase. Glow Cosmetics allows clients to browse services, book appointments, purchase products, and manage their beauty journey all in one place.

![Glow Cosmetics](public/images/logo.png)

## Features

- **Service Booking** - Schedule beauty and wellness appointments
- **Product Shopping** - Browse and purchase cosmetic products
- **User Authentication** - Secure login and registration
- **Client Dashboard** - Manage appointments and orders
- **Admin Portal** - Complete business management dashboard
- **Responsive Design** - Optimized for all devices

## Installation & Setup

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- Supabase account

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/glow-cosmetics.git
cd glow-cosmetics
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Set up the database**

Run the SQL scripts in the Supabase SQL editor to create all necessary tables and policies. The main schema is defined in `tables.sql`.

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Schema

Glow Cosmetics uses Supabase as its backend database with the following core tables:

- **profiles** - User profile information
- **products** - Beauty and wellness products
- **services** - Available services
- **bookings** - Client appointment bookings
- **orders** - Purchase records
- **carts** - Shopping cart data

Row-level security policies are implemented to ensure data security.

## Usage

### Client Experience

1. **Browse Services** - Explore available beauty treatments
2. **Book Appointments** - Select service, date, and time
3. **Shop Products** - Browse the online store
4. **Manage Profile** - View past appointments and update information

### Admin Experience

1. **Dashboard** - View key metrics (appointments, sales, clients)
2. **Appointment Management** - Schedule, reschedule, or cancel bookings
3. **Client Management** - Add and manage client information
4. **Inventory Management** - Add, update, or remove products

## Routes & Navigation

### Public Routes

- `/` - Homepage
- `/services` - Available services
- `/products` - Product catalog
- `/cart` - Shopping cart
- `/about` - About the business
- `/contact` - Contact information

### Protected Client Routes

- `/dashboard` - Client dashboard
- `/bookings` - Client's appointments

### Admin Routes

- `/admin` - Admin dashboard
- `/admin/clients` - Client management
- `/admin/appointments` - Appointment management
- `/admin/products` - Product management
- `/admin/products/[id]` - Edit specific product
- `/admin/products/new` - Add new product

## Technologies Used

### Core

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Supabase** - Backend database and authentication
- **React Server Components** - For improved performance
- **Server Actions** - For form handling and data mutations

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Re-usable components built with Radix UI and Tailwind
- **Lucide Icons** - SVG icon library

### Data Fetching & State Management

- **React Query** - For client-side data fetching
- **Next.js Cache** - For server-side data caching
- **Redux Toolkit** (optional) - For complex state management

### Deployment

- **Vercel** - Recommended deployment platform for Next.js

## Project Structure

```
glow-cosmetics/
├── app/                  # Next.js App Router
│   ├── admin/            # Admin routes
│   ├── dashboard/        # Client dashboard
│   ├── products/         # Product pages
│   ├── services/         # Services pages
│   ├── actions/          # Server actions
│   └── api/              # API routes
├── components/           # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # UI components from shadcn
│   └── client/           # Client-specific components
├── lib/                  # Utility functions
├── public/               # Static assets
├── types/                # TypeScript types
├── utils/                # Helper functions
│   └── supabase/         # Supabase client utilities
└── middleware.ts         # Next.js middleware for auth
```

## Development & Contributing

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit them: `git commit -m "Add new feature"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Open a Pull Request

### Code Style & Linting

The project uses ESLint and Prettier for code formatting. Run linting checks with:

```bash
npm run lint
# or
yarn lint
```

## Deployment

The application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the repository to Vercel
3. Set the required environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/) - For the wonderful React framework
- [Supabase](https://supabase.io/) - For the open-source Firebase alternative
- [Shadcn UI](https://ui.shadcn.com/) - For beautifully designed components
- [TailwindCSS](https://tailwindcss.com/) - For the utility-first CSS framework

---

Made with ❤️ by Emerah Damian and Emerah Cosmas
