# Code For Good - Authentication System

A complete authentication system with OAuth integration and role-based access control. Built for easy integration with Next.js frontend.

## Features

- 🔐 Multiple Authentication Methods:
  - Email/Password with verification
  - Google OAuth
- 👥 Role-Based Access Control:
  - Admin, User, and Guest roles
  - Protected routes
  - Role-specific features
- 🔒 Security Features:
  - NextAuth.js implementation
  - Password hashing
  - Email verification
- 🎯 Frontend Integration:
  - Next.js optimized
  - API routes
- 📝 Comprehensive Documentation
- ✨ Clean, maintainable code structure

## Tech Stack

- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Frontend**: Next.js, React

## Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local instance or MongoDB Atlas)
- Google OAuth credentials (from Google Cloud Console)
- Facebook OAuth credentials (from Facebook Developer Portal)
- Email provider for sending verification emails and notifications

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure your environment variables by creating a `.env` file with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/spacece_db
# Or use MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/spacece_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Client URL (Frontend application)
CLIENT_URL=http://localhost:3000

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM_NAME=SpacECE Digital Transformation
```

4. Start the development server:

```bash
npm start
```

5. For development mode with automatic restart:

```bash
npm run dev
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/register`: Register new user
- `POST /api/auth/admin/register`: Register new admin
- `POST /api/auth/login`: Login with email/password
- `POST /api/auth/admin/login`: Admin login
- `POST /api/auth/verify-email`: Verify email with OTP
- `POST /api/auth/resend-verification`: Resend OTP verification
- `GET /api/auth/google`: Start Google OAuth flow
- `GET /api/auth/facebook`: Start Facebook OAuth flow
- `GET /api/auth/user`: Get current authenticated user
- `PUT /api/auth/role/:userId`: Update user role (admin only)
- `GET /api/auth/logout`: Logout user

### User Routes

- `GET /api/users`: Get all users (admin only)
- `GET /api/users/:id`: Get user by ID (admin only)
- `PUT /api/users/:id`: Update user details (admin or self)
- `DELETE /api/users/:id`: Delete user (admin only)

### Child Management Routes

- `POST /api/children`: Create a new child profile
- `GET /api/children`: Get all children (filtered by role)
- `GET /api/children/:id`: Get child by ID
- `PUT /api/children/:id`: Update child information
- `DELETE /api/children/:id`: Delete a child (admin only)

### Milestone Tracking Routes

- `POST /api/milestones`: Create a new milestone entry
- `GET /api/milestones/:id`: Get milestone by ID
- `GET /api/milestones/child/:childId`: Get milestones for a child
- `PUT /api/milestones/:id`: Update milestone status

### Volunteer Visit Routes

- `POST /api/visits`: Create a new visit record
- `GET /api/visits/:id`: Get visit details
- `GET /api/visits/child/:childId`: Get visits for a child
- `GET /api/visits/volunteer/:volunteerId`: Get visits by volunteer
- `PUT /api/visits/:id`: Update visit record

### Activity Template Routes

- `POST /api/activities`: Create a new activity template (admin only)
- `GET /api/activities`: Get all activities
- `GET /api/activities/:id`: Get activity by ID
- `GET /api/activities/age/:ageGroup`: Get activities by age group
- `PUT /api/activities/:id`: Update activity (admin only)

### Report Routes

- `GET /api/reports/child/:id`: Get comprehensive child report
- `GET /api/reports/summary`: Get administrative summary report
- `GET /api/reports/volunteer/:volunteerId`: Get volunteer performance report

## Frontend Integration Guide

### 1. Setup Authentication Context

```javascript
// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);
  
  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data.data);
    } catch (err) {
      console.error('Error fetching user', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };
  
  // Email/Password Login
  const login = async (email, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/api/auth/admin/login' : '/api/auth/login';
      const res = await axios.post(endpoint, { email, password });
      
      if (res.data.success) {
        const { token, user } = res.data.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };
  
  // OAuth Login
  const loginWithOAuth = (provider, isAdmin = false) => {
    const adminPath = isAdmin ? 'admin/' : '';
    window.location.href = `/api/auth/${adminPath}${provider}`;
  };
  
  // Logout
  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginWithOAuth, 
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 2. Create Login Page

```javascript
// src/pages/Login.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithOAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      return setError('Email and password are required');
    }
    
    const result = await login(email, password, isAdmin);
    if (result.success) {
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <h1>{isAdmin ? 'Admin Login' : 'Login'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={() => setIsAdmin(!isAdmin)}
            />
            Login as Administrator
          </label>
        </div>
        
        <button type="submit" className="primary-button">
          Login
        </button>
      </form>
      
      <div className="oauth-buttons">
        <button 
          onClick={() => loginWithOAuth('google', isAdmin)}
          className="google-button"
        >
          Login with Google
        </button>
        <button 
          onClick={() => loginWithOAuth('facebook', isAdmin)}
          className="facebook-button"
        >
          Login with Facebook
        </button>
      </div>
      
      <div className="links">
        <a href="/register">Register</a> | 
        <a href="/forgot-password">Forgot Password?</a>
      </div>
    </div>
  );
}
```

### 3. Protected Route Component

```javascript
// src/components/ProtectedRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requireAdmin }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};
```

### 4. API Integration Example

```javascript
// src/services/childService.js
import axios from 'axios';

// Add authorization header to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const childService = {
  // Get all children (filtered by user role)
  getChildren: async () => {
    try {
      const response = await axios.get('/api/children');
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  },
  
  // Get child by ID
  getChildById: async (id) => {
    try {
      const response = await axios.get(`/api/children/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching child ${id}:`, error);
      throw error;
    }
  },
  
  // Create new child
  createChild: async (childData) => {
    try {
      const response = await axios.post('/api/children', childData);
      return response.data;
    } catch (error) {
      console.error('Error creating child:', error);
      throw error;
    }
  },
  
  // Update child
  updateChild: async (id, childData) => {
    try {
      const response = await axios.put(`/api/children/${id}`, childData);
      return response.data;
    } catch (error) {
      console.error(`Error updating child ${id}:`, error);
      throw error;
    }
  }
};
```

## Security Recommendations

- ✅ Always use HTTPS in production environments
- ✅ Keep your JWT secret secure and rotate it regularly 
- ✅ Implement proper input validation for all API endpoints
- ✅ Store sensitive data (passwords, tokens) securely using encryption/hashing
- ✅ Set appropriate expiry times for authentication tokens
- ✅ Implement rate limiting for authentication attempts to prevent brute force attacks
- ✅ Apply proper role-based access control checks for every endpoint
- ✅ Use secure headers (CSRF protection, XSS prevention)
- ✅ Validate all file uploads and implement size restrictions
- ✅ Implement proper error handling without leaking sensitive information
- ✅ Regularly update dependencies to patch security vulnerabilities

## Project Structure

```
├── config/              # Configuration files
│   ├── db.js            # Database connection setup
│   └── passport.js      # Authentication strategy configuration
├── controllers/         # Route controller functions
│   ├── activityController.js
│   ├── authController.js
│   ├── childController.js
│   ├── milestoneController.js
│   ├── reportController.js
│   ├── userController.js
│   └── visitController.js
├── middlewares/         # Custom middleware functions
│   ├── auth.js          # Authentication middleware
│   └── errorHandler.js  # Error handling middleware
├── models/              # Database models
│   ├── Activity.js
│   ├── Child.js
│   ├── Milestone.js
│   ├── User.js
│   └── Visit.js
├── routes/              # API route definitions
│   ├── activityRoutes.js
│   ├── authRoutes.js
│   ├── childRoutes.js
│   ├── milestoneRoutes.js
│   ├── reportRoutes.js
│   ├── userRoutes.js
│   └── visitRoutes.js
├── utils/               # Utility functions
│   └── emailService.js  # Email sending functionality
├── scripts/             # Utility scripts
│   └── create-admin.js  # Script to create admin users
├── index.js             # Main application entry point
└── .env                 # Environment variables
```

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
