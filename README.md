# BMM Donation Portal - Astro Version

This project has been converted from React to Astro, removing React Router and TanStack Query dependencies while maintaining all functionality.

## Key Changes Made

### Dependencies Removed
- `@tanstack/react-query` - Replaced with direct API calls
- `react-router-dom` - Replaced with Astro routing and `window.location.href`
- `react-ga4` - Replaced with standard Google Analytics 4 script

### Dependencies Added
- `@astrojs/react` - For React component islands
- `@astrojs/tailwind` - For Tailwind CSS integration
- `@astrojs/partytown` - For Google Analytics performance

### File Structure Changes

#### Converted Pages (JSX → Astro)
- `src/pages/index.astro` - Home page
- `src/pages/login.astro` - Login page
- `src/pages/signup.astro` - Signup page
- `src/pages/checkout.astro` - Checkout page
- `src/pages/profile.astro` - Profile page
- `src/pages/payment-success.astro` - Payment success page
- `src/pages/payment-failure.astro` - Payment failure page
- `src/pages/forgot-password.astro` - Forgot password page
- `src/pages/404.astro` - 404 page
- `src/pages/fundraiser.astro` - Fundraiser page
- `src/pages/account/canvasser.astro` - Canvasser dashboard

#### New Components Created
- `src/components/Home.jsx` - Home component
- `src/components/Login.jsx` - Login component
- `src/components/Signup.jsx` - Signup component
- `src/components/Checkout.jsx` - Checkout component
- `src/components/Profile.jsx` - Profile component
- `src/components/SuccessPage.jsx` - Success page component
- `src/components/PaymentFailurePage.jsx` - Payment failure component
- `src/components/ForgotPassword.jsx` - Forgot password component
- `src/components/NotFound.jsx` - 404 component
- `src/components/Fundraiser.jsx` - Fundraiser component
- `src/components/Canvasser.jsx` - Canvasser component
- `src/components/CartWrapper.jsx` - Cart wrapper for Astro
- `src/components/HeaderWrapper.jsx` - Header wrapper for Astro

#### Layout and Configuration
- `src/layouts/Layout.astro` - Main layout component
- `astro.config.mjs` - Updated with React, Tailwind, and Partytown integrations
- `tailwind.config.mjs` - Tailwind configuration
- `postcss.config.mjs` - PostCSS configuration

#### Utilities
- `src/utils/gaTracking.js` - New Google Analytics utility for Astro

### Routing Changes
- Replaced React Router with Astro file-based routing
- Navigation now uses `window.location.href` instead of `useNavigate`
- All routes are now accessible via standard URLs

### State Management
- Removed TanStack Query for data fetching
- Replaced with direct API calls using `useEffect` and `useState`
- Maintained all existing context providers (Auth, Cart, CanvasserAuth)

### Google Analytics
- Replaced `react-ga4` with standard GA4 script
- Added Partytown integration for better performance
- Created new `gaTracking.js` utility for event tracking

## Development

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Features Maintained
- ✅ User authentication and registration
- ✅ Donation flow with multi-step process
- ✅ Payment processing (Stripe/PayPal)
- ✅ Fundraiser creation and management
- ✅ Profile management
- ✅ Cart functionality
- ✅ Google Analytics tracking
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling

## Performance Improvements
- Static site generation with Astro
- Reduced JavaScript bundle size
- Better SEO with server-side rendering
- Improved loading performance
- Partytown integration for analytics

## Migration Notes
- All React components are now used as islands with `client:load`
- Navigation uses standard anchor tags and `window.location.href`
- API calls are now made directly without React Query
- Google Analytics is loaded via Partytown for better performance
- All existing functionality has been preserved
