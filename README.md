# Ladies Collection

Ladies Collection is a responsive fashion ecommerce demo built with React, TypeScript, Vite, Tailwind CSS, Zustand, and React Router.

The project includes three connected experiences:

- Customer storefront with product browsing, search, cart, checkout, orders, profile, and notifications
- Admin portal for managing products, vendors, orders, payments, reports, and settings
- Vendor portal for managing listings, orders, shipping, earnings, and settlements

The application currently runs on local mock data. No real accounts, payments, or orders are used.

## Requirements

- Node.js 18 or newer
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run ESLint:

```bash
npm run lint
```

## Main Routes

| Experience | Route |
| --- | --- |
| Customer storefront | `/shop` |
| Customer login | `/shop/login` |
| Customer registration | `/shop/register` |
| Customer cart | `/shop/cart` |
| Customer profile | `/shop/profile` |
| Admin login | `/login` |
| Admin portal | `/` |
| Vendor login | `/vendor/login` |
| Vendor portal | `/vendor` |

## Demo Accounts

Customer:

- Email: `ananya@example.com`
- Password: any password with 4 or more characters

Admin:

- Email: `admin@ladiescollection.demo`
- Password: any password with 6 or more characters

Vendor:

- Email: `priya@fashiontrends.demo`
- Password: any password with 6 or more characters

The demo accounts and session state are stored locally in the browser through Zustand persistence.

## Project Structure

```text
src/
  app/             Shared data, components, charts, and UI primitives
  config/          Axios, Supabase, and React Query configuration
  features/
    admin/         Admin portal pages and hooks
    auth/          Login and registration pages
    customer/      Storefront pages and customer data
    vendor/        Vendor portal pages and hooks
  layouts/         Storefront, admin, vendor, and auth layouts
  routes/          Application route registry
  services/        API service abstractions
  store/           Zustand authentication, cart, and wishlist stores
  styles/          Shared styling
  types/           Shared TypeScript types
```

## Branding

The Ladies Collection logo is stored at `src/assets/Lc.png`. It is used by the storefront, portal layouts, login screens, and browser favicon.

## Notes

- Customer logout is available from the profile menu and profile page.
- Cart, wishlist, authentication, and profile changes are mock browser-local state.
- The production build may report a large JavaScript chunk warning; this does not prevent the build from completing.