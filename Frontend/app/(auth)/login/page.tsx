'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, LogIn, Shield } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"

export default function Page(): React.JSX.Element {
  const { user, login, loginWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') as 'parent' | 'admin' | 'volunteer' || 'parent'

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      let redirectPath = '/dashboard'
      if (user.role === 'admin') redirectPath = '/admin/dashboard'
      else if (user.role === 'volunteer') redirectPath = '/volunteer/dashboard'
      router.replace(redirectPath)
    }
  }, [user, router])
  
  const [isPending, startTransition] = React.useTransition()
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    phone: "",
    password: ""
  })

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.phone || !formData.password) {
      toast.error("Please fill in all fields")
      return
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }
    
    startTransition(async () => {
      try {
        await login(formData.phone, formData.password, role)
        toast.success("Login successful")
        let redirectPath = '/dashboard'
        if (role === 'admin') redirectPath = '/admin/dashboard'
        else if (role === 'volunteer') redirectPath = '/volunteer/dashboard'
        router.push(redirectPath)
      } catch (error: any) {
        toast.error(error.message || "Failed to login")
      }
    })
  }, [formData, login, router, role, startTransition])

  const handleGoogleLogin = React.useCallback(async () => {
    if (isGoogleLoading) return
    setIsGoogleLoading(true)
    
    try {
      await loginWithGoogle(role)
    } catch (error: any) {
      toast.error(error.message || "Failed to login with Google")
    } finally {
      setIsGoogleLoading(false)
    }
  }, [loginWithGoogle, role])

  return (
    <div className="flex w-full justify-center items-center min-h-screen py-8 px-4 bg-white text-black dark:bg-black dark:text-white transition-colors">
      <div className="w-full border border-gray-800 max-w-md p-6 md:p-8 pb-12 space-y-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-blue-900/10">
        <div className="text-center py-4 space-y-2">
          <h1 className="text-4xl font-extrabold">ChildCare</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {role === 'admin' ? "Admin Login" : role === 'volunteer' ? "Volunteer Login" : "Parent Login"}
          </p>
        </div>

        {/* Role selector */}
        <div className="flex justify-center gap-4">
          <Button
            variant={role === 'parent' ? "default" : "outline"}
            onClick={() => router.push('/login')}
            className="flex-1"
          >
            Parent
          </Button>
          <Button
            variant={role === 'volunteer' ? "default" : "outline"}
            onClick={() => router.push('/login?role=volunteer')}
            className="flex-1"
          >
            Volunteer
          </Button>
          <Button
            variant={role === 'admin' ? "default" : "outline"}
            onClick={() => router.push('/login?role=admin')}
            className="flex-1"
          >
            <Shield className="h-5 w-5 mr-2" />
            Admin
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Phone Number"
              required
              pattern="[0-9]{10}"
              value={formData.phone}
              onChange={handleInputChange}
              className="bg-white dark:bg-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="bg-white dark:bg-gray-800"
            />
          </div>
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-600 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isGoogleLoading}
          onClick={handleGoogleLogin}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-4 w-4" />
          )}
          {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
              Don&apos;t have an account?
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/register${role !== 'parent' ? `?role=${role}` : ''}`)}
        >
          Create Account
        </Button>
      </div>
    </div>
  )
}
