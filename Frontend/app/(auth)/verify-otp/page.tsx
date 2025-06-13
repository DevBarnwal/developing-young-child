"use client"

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from 'sonner'

export default function VerifyOTPPage() {
  const { verifyOTP, resendOTP } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone')
  const role = searchParams.get('role')
  const [otp, setOtp] = React.useState("")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [resendDisabled, setResendDisabled] = React.useState(false)
  const [countdown, setCountdown] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Auto-focus input on mount
  React.useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle countdown for resend button
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
    }
  }, [countdown])

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || isLoading) return
    
    // Validate OTP format
    const cleanOTP = otp.trim()
    if (!/^\d{6}$/.test(cleanOTP)) {
      setError("Please enter a valid 6-digit verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await verifyOTP(phone, cleanOTP)
      
      toast.success("Phone number verified successfully!", {
        id: `verify-success-${Date.now()}`,
        duration: 3000,
      })
      
      // Add a small delay before redirecting
      setTimeout(() => {
        router.push(`/login${role ? `?role=${role}` : ''}`)
      }, 1000)
      
    } catch (error: any) {
      setOtp("")
      setError(error.message || "Verification failed. Please try again.")
      
      toast.error(error.message || "Verification failed", {
        id: `verify-error-${Date.now()}`,
        duration: 5000,
      })
      
      inputRef.current?.focus()
    } finally {
      setIsLoading(false)
    }
  }, [phone, otp, role, router, verifyOTP, isLoading])

  const handleResendOTP = React.useCallback(async () => {
    if (!phone || resendDisabled) return

    try {
      await resendOTP(phone)
      toast.success("New verification code sent!")
      setResendDisabled(true)
      setCountdown(30) // Start 30-second countdown
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code")
    }
  }, [phone, resendDisabled, resendOTP])

  // Handle OTP input changes
  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setOtp(value)
    setError("")
    
    // Auto-submit when OTP is complete
    if (value.length === 6) {
      const event = new Event('submit') as any
      setTimeout(() => handleSubmit(event), 100)
    }
  }

  // Redirect if no phone number
  React.useEffect(() => {
    if (!phone) {
      router.push('/register')
    }
  }, [phone, router])

  if (!phone) return null

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/register')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Verify Your Phone Number</h1>
          </div>

          <div className="text-center space-y-4">
            <p className="text-lg">
              We&apos;ve sent a verification code to
            </p>
            <p className="text-lg font-semibold">
              {phone}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={handleOTPChange}
                className="text-center text-lg tracking-widest"
              />
              
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Code
                </>
              )}
            </Button>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn&apos;t receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                disabled={resendDisabled}
                onClick={handleResendOTP}
                className="text-primary hover:text-primary/80"
              >
                {resendDisabled 
                  ? `Resend code in ${countdown}s`
                  : "Resend code"
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
