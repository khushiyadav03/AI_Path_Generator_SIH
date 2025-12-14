# LearnPath AI - Frontend Application

> **Note**: For complete project documentation including ML approach, dataset information, and algorithms, see the [main README](../README.md).

This directory contains the React + Express frontend application for LearnPath AI.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Configure Environment Variables
Create a `.env` file in the root directory (copy from `.env.example`):
```bash
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5173/api

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests

## API Endpoints

### Authentication (Django-compatible)
- `POST /api/auth/registration/` - User registration
  - Body: `{ username, email, password1, password2, academic_year }`
  - Returns: `{ access, refresh, user }`

- `POST /api/auth/login/` - User login
  - Body: `{ username, password }` (username can be email)
  - Returns: `{ access, refresh, user }`

- `POST /api/auth/token/refresh/` - Refresh access token
  - Body: `{ refresh }`
  - Returns: `{ access }`

### Other Endpoints
- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `GET /api/auth/user/:email` - Get user by email
- `POST /api/auth/reset-request` - Request password reset
- `POST /api/auth/reset-password` - Reset password

## Features

- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Username and email login support
- ✅ Academic year field (1-4)
- ✅ Django-compatible API responses
- ✅ Password reset via email
- ✅ Google OAuth integration (optional)
- ✅ User limit: Maximum 10 users

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
│   ├── lib/         # Core libraries (auth, database, jwt)
│   └── routes/      # API route handlers
├── shared/          # Shared types
└── package.json
```

## Notes

- User data is stored in `server/data/users.json`
- Default JWT secret is used if not set in `.env`
- Email and Google OAuth are optional features

