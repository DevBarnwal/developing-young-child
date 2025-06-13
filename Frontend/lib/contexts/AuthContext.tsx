'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'

// Base user properties interface
interface BaseUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'parent' | 'volunteer' | 'user'
  isEmailVerified: boolean
  authMethod?: 'local' | 'google' | 'facebook'
}

// Parent profile specific fields
interface ParentProfile {
  contactInformation: {
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    preferredLanguage: 'English' | 'Hindi' | 'Marathi' | 'Other'
  }
  children?: Array<{
    id: string
    name: string
    dateOfBirth: string
    gender: 'Male' | 'Female' | 'Other'
    educationalStatus?: string
    healthInformation?: {
      specialNeeds?: string[]
      medicalConditions?: string[]
    }
  }>
}

// Volunteer profile specific fields
interface VolunteerProfile {
  qualifications: string[]
  specializedSkills: string[]
  availability: {
    days: string[]
    hours: string
    preferredLocation?: string
  }
  trainingStatus: {
    isCompleted: boolean
    certificationsCompleted?: string[]
    lastTrainingDate?: string
  }
  assignedChildren?: string[]
}

// Admin profile has no additional fields as per architecture

// Complete user interface combining base and role-specific profiles
interface User extends BaseUser {
  parentProfile?: ParentProfile
  volunteerProfile?: VolunteerProfile
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phone: string, password: string, role?: 'parent' | 'admin' | 'volunteer') => Promise<void>
  loginWithGoogle: (role?: 'parent' | 'admin' | 'volunteer') => Promise<void>
  loginWithFacebook: (role?: 'parent' | 'admin' | 'volunteer') => Promise<void>
  register: (
    data: {
      name: string
      phone: string
      email: string
      password: string
      role: 'parent' | 'admin' | 'volunteer'
    } & (
      | { role: 'parent', parentProfile: Omit<ParentProfile, 'children'> }
      | { role: 'volunteer', volunteerProfile: Omit<VolunteerProfile, 'assignedChildren' | 'trainingStatus'> }
      | { role: 'admin' }
    )
  ) => Promise<void>
  logout: () => Promise<void>
  verifyOTP: (phone: string, otp: string) => Promise<void>
  resendOTP: (phone: string) => Promise<void>
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function getTokenFromCookie() {
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const token = getTokenFromCookie()
      if (!token) {
        setLoading(false)
        return
      }

      // Decode token to get user info
      const decoded = jwtDecode<any>(token)
      if (!decoded || !decoded.id) {
        throw new Error('Invalid token')
      }

      // Add token to axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Get the current user data from the API
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const userData = response.data.data
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          isEmailVerified: userData.isEmailVerified,
          authMethod: userData.authMethod,
          // Add profile data based on role
          ...(userData.role === 'parent' && { parentProfile: userData.parentProfile }),
          ...(userData.role === 'volunteer' && { volunteerProfile: userData.volunteerProfile })
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // Clear invalid tokens
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (phone: string, password: string, role?: 'parent' | 'admin' | 'volunteer') => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        phone,
        password,
        role: role || 'parent'
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed')
      }

      const { token } = response.data.data
      if (!token) {
        throw new Error('No token received')
      }

      // Set token in cookie and axios headers
      document.cookie = `token=${token}; path=/; max-age=604800;` // 7 days
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      const decoded = jwtDecode<any>(token)
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        phone: decoded.phone,
        role: decoded.role,
        isEmailVerified: true,
        authMethod: decoded.authMethod
      })

      // Re-fetch complete user data including role-specific profile
      await checkUser()

    } catch (error: any) {
      console.error('Login error:', error)
      // Cleanup on login failure
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      delete axios.defaults.headers.common['Authorization']
      throw new Error(error.response?.data?.message || error.message || 'Login failed')
    }
  }

  const register = async (
    data: {
      name: string
      phone: string
      email: string
      password: string
      role: 'parent' | 'admin' | 'volunteer'
    } & (
      | { role: 'parent', parentProfile: Omit<ParentProfile, 'children'> }
      | { role: 'volunteer', volunteerProfile: Omit<VolunteerProfile, 'assignedChildren' | 'trainingStatus'> }
      | { role: 'admin' }
    )
  ) => {
    try {
      // Basic validation
      if (!data.name || !data.phone || !data.email || !data.password) {
        throw new Error('All required fields must be filled')
      }

      // Phone number validation
      if (!/^\d{10}$/.test(data.phone)) {
        throw new Error('Phone number must be 10 digits')
      }

      // Email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Invalid email format')
      }

      // Password validation
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      // Role-specific validation
      if (data.role === 'parent' && 'parentProfile' in data) {
        const { parentProfile } = data
        if (!parentProfile.contactInformation.address.city || 
            !parentProfile.contactInformation.address.state) {
          throw new Error('Parent profile requires complete address information')
        }
      } else if (data.role === 'volunteer' && 'volunteerProfile' in data) {
        const { volunteerProfile } = data
        if (!volunteerProfile.qualifications?.length || !volunteerProfile.availability) {
          throw new Error('Volunteer profile requires qualifications and availability')
        }
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, data)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed')
      }

      // If registration is successful but requires phone verification
      if (response.data.requiresPhoneVerification) {
        return {
          success: true,
          requiresPhoneVerification: true,
          phone: data.phone
        }
      }

      return response.data
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Registration failed')
    }
  }

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        phone,
        otp
      })

      if (response.data.success) {
        const { token } = response.data.data
        document.cookie = `token=${token}; path=/;`
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        const decoded = jwtDecode<any>(token)
        setUser({
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          phone: decoded.phone,
          role: decoded.role,
          isEmailVerified: true,
          authMethod: decoded.authMethod
        })
      } else {
        throw new Error(response.data.message || 'OTP verification failed')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'OTP verification failed')
    }
  }

  const resendOTP = async (phone: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
        phone
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend OTP')
      }

      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to resend OTP')
    }
  }

  const logout = async () => {
    try {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
      
      // Call logout endpoint if needed
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (userId: string, data: Partial<User>) => {
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile/${userId}`, data)

      if (response.data.success) {
        setUser(prev => prev ? { ...prev, ...data } : null)
      } else {
        throw new Error(response.data.message || 'Profile update failed')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Profile update failed')
    }
  }

  const loginWithGoogle = async (role?: 'parent' | 'admin' | 'volunteer') => {
    try {
      // Open Google login in a popup
      window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google${role ? `?role=${role}` : ''}`,
        'Google Login',
        'width=500,height=600'
      )

      // Listen for message from popup
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== process.env.NEXT_PUBLIC_API_URL) return

        if (event.data.type === 'auth-success') {
          const { token } = event.data
          document.cookie = `token=${token}; path=/;`
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          const decoded = jwtDecode<any>(token)
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            phone: decoded.phone || '',
            role: decoded.role,
            isEmailVerified: true,
            authMethod: decoded.authMethod
          })

          window.removeEventListener('message', handleMessage)
          toast.success('Successfully logged in with Google')
        } else if (event.data.type === 'auth-error') {
          toast.error(event.data.message || 'Failed to login with Google')
          window.removeEventListener('message', handleMessage)
        }
      }

      window.addEventListener('message', handleMessage)
    } catch (error: any) {
      console.error('Google login error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to login with Google')
    }
  }

  const loginWithFacebook = async (role?: 'parent' | 'admin' | 'volunteer') => {
    try {
      // Open Facebook login in a popup
      window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook${role ? `?role=${role}` : ''}`,
        'Facebook Login',
        'width=500,height=600'
      )

      // Listen for message from popup
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== process.env.NEXT_PUBLIC_API_URL) return

        if (event.data.type === 'auth-success') {
          const { token } = event.data
          document.cookie = `token=${token}; path=/;`
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          const decoded = jwtDecode<any>(token)
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            phone: decoded.phone || '',
            role: decoded.role,
            isEmailVerified: true,
            authMethod: decoded.authMethod
          })

          window.removeEventListener('message', handleMessage)
          toast.success('Successfully logged in with Facebook')
        } else if (event.data.type === 'auth-error') {
          toast.error(event.data.message || 'Failed to login with Facebook')
          window.removeEventListener('message', handleMessage)
        }
      }

      window.addEventListener('message', handleMessage)
    } catch (error: any) {
      console.error('Facebook login error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to login with Facebook')
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithGoogle,
      loginWithFacebook,
      register,
      logout,
      verifyOTP,
      resendOTP,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
