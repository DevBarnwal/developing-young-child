'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

export default function OAuthCallback() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      toast.error("Authentication failed: No token provided")
      router.push('/login')
      return
    }
    
    const processToken = async () => {
      try {
        // Decode the token to get user info
        const decoded = jwtDecode(token) as any
        
        // Check if name is missing
        if (!decoded.name) {
          // Extract email username to use as name if name is missing
          const emailUsername = decoded.email.split('@')[0]
          const name = emailUsername || 'User'
          
          // Update the user profile with a name
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, 
            { name },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        }
        
        // Store token in cookie
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Redirect to appropriate dashboard
        const redirectPath = decoded.role === 'admin' ? '/admin/dashboard' : '/dashboard'
        toast.success("Successfully signed in!")
        router.push(redirectPath)
      } catch (error) {
        console.error("Error processing OAuth callback:", error)
        toast.error("Authentication failed. Please try again.")
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    processToken()
  }, [router, searchParams])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center p-8 rounded-lg shadow-lg bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold mb-2 dark:text-white">Completing Sign In</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we set up your account...</p>
      </div>
    </div>
  )
}
