# Next.js Authentication System with OTP Verification

A modern, secure authentication system built with Next.js 14, featuring OTP verification, role-based access control, and dark mode support. The system provides a seamless user experience with email/phone number authentication and responsive design.

This project implements a comprehensive authentication flow with features like user registration, login, password recovery, and session management. It uses Next.js's App Router architecture and integrates with MongoDB for data persistence. The UI is built using HeroUI components and Tailwind CSS for a polished, responsive design that supports both light and dark themes.

## Repository Structure
```
.
├── app/                      # Next.js application routes and API handlers
│   ├── api/                 # API route handlers for authentication and user management
│   ├── auth/                # Authentication-related pages (login, register, forgot password)
│   └── dashboard/           # Protected dashboard route
├── components/              # Reusable React components
│   ├── auth/               # Authentication-related components (SignIn, Register, ForgotPassword)
│   ├── sections/           # Layout sections like Navbar
│   └── ui/                 # UI components like OTP input
├── lib/                    # Utility functions and database connection
│   ├── db.ts              # MongoDB connection configuration
│   ├── functions.ts       # Helper functions for OTP and validation
│   └── nodemailer.ts      # Email service configuration
├── models/                 # MongoDB models for User and OTP
└── types/                  # TypeScript type definitions
```

## Usage Instructions
### Prerequisites
- Node.js 18.x or later
- MongoDB database
- Email service provider credentials (for OTP delivery)
- npm or yarn package manager

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
EMAIL_SERVER=your_email_server_details
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

### Quick Start
1. Register a new user:
   - Navigate to `/auth/register`
   - Enter email or phone number
   - Verify OTP sent to your email/phone
   - Complete profile with name and password

2. Login:
   - Navigate to `/auth/login`
   - Enter email/phone and password
   - Access dashboard after successful authentication

### More Detailed Examples
1. Password Recovery:
```typescript
// Request password reset
await axios.post('/api/auth/forgot-password', { id: 'user@example.com' });

// Verify OTP and set new password
await axios.post('/api/auth/update-password', {
  id: 'user@example.com',
  password: 'newPassword'
});
```

2. Protected API Routes:
```typescript
// Access protected route with session
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${session.token}`
  }
});
```

### Troubleshooting
1. OTP Issues:
   - Check spam folder for email OTP
   - Verify phone number format (should include country code)
   - Maximum 5 OTP attempts allowed before timeout

2. Authentication Errors:
   - Clear browser cookies and local storage
   - Verify email/phone format
   - Check for correct password requirements (min 8 characters)

3. Database Connection:
   - Verify MongoDB connection string
   - Check database user permissions
   - Ensure network access to MongoDB instance

## Data Flow
The authentication system follows a secure flow from registration to authenticated access.

```ascii
User Input -> OTP Verification -> Profile Creation -> Session Management
     │              │                    │                   │
     ▼              ▼                    ▼                   ▼
[Email/Phone] -> [OTP API] -> [User Registration] -> [Protected Routes]
```

Component Interactions:
1. User enters email/phone in registration form
2. System generates and sends OTP via email/SMS
3. User verifies OTP to proceed with registration
4. Profile details are saved to MongoDB
5. JWT session token is generated for authentication
6. Protected routes verify session token
7. Role-based access control manages permissions
8. Session management handles logout and expiration