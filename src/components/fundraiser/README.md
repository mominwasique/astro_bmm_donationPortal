# Fundraiser Components

This directory contains modal components for authentication in the fundraiser page.

## Components

### AuthModal

Main modal component that manages both login and register views with smooth transitions.

**Props:**

- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal is closed

**Usage:**

```jsx
import { AuthModal } from '../components/fundraiser';

<AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />;
```

### LoginModal

Login form modal with email and password fields.

**Features:**

- Email and password validation
- Remember me checkbox
- Forgot password link
- Password visibility toggle
- Loading states
- Error handling with toast notifications

### RegisterModal

Registration form modal with comprehensive user registration.

**Features:**

- First name, last name, email, password fields
- Password confirmation
- Real-time form validation
- Password visibility toggles
- Loading states
- Error handling with toast notifications

## Design Features

- **Modern UI**: Clean, modern design with rounded corners and shadows
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper labels, focus states, and keyboard navigation
- **Smooth Transitions**: CSS transitions for better user experience
- **Error Handling**: Real-time validation with clear error messages
- **Loading States**: Visual feedback during API calls
- **Toast Notifications**: Success and error messages using react-hot-toast

## Color Scheme

Uses the project's primary color scheme:

- Primary: `#1B4743` (dark primary)
- Hover: `#163a36` (darker primary)
- Background: White with subtle shadows
- Text: Gray scale for readability

## Integration

The modals are integrated into the Fundraiser page and appear when the "CREATE FUNDRAISER" button is clicked. They handle authentication state management through the AuthContext and provide seamless user experience for both new and existing users.
