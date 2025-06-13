"use client"

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, UserPlus, Shield } from "lucide-react"
import { useAuth } from "@/lib/contexts/AuthContext"
import { toast } from 'sonner'

export default function SignUpPage() {
  const { user, register } = useAuth()
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

  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    // Base user fields
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    
    // Address fields (for both parent and volunteer)
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",

    // Parent specific fields
    preferredLanguage: "English" as const,

    // Volunteer specific fields
    qualifications: "",
    specializedSkills: "",
    availableDays: [] as string[],
    availableHours: "",
    preferredLocation: "",
  })

  const handleInputChange = React.useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }))
  }

  const validateForm = (): boolean => {
    // Base validation for all roles
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return false
    }

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return false
    }

    // Role-specific validation
    if (role === 'parent' || role === 'volunteer') {
      if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
        toast.error("Please fill in all address fields")
        return false
      }
    }

    if (role === 'volunteer') {
      if (!formData.qualifications || !formData.specializedSkills || 
          !formData.availableDays.length || !formData.availableHours) {
        toast.error("Please fill in all volunteer-specific fields")
        return false
      }
    }

    return true
  }

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const registrationData: any = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: role,
      }

      if (role === 'parent') {
        registrationData.parentProfile = {
          contactInformation: {
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country,
            },
            preferredLanguage: formData.preferredLanguage,
          }
        }
      } else if (role === 'volunteer') {
        registrationData.volunteerProfile = {
          qualifications: formData.qualifications.split(',').map(s => s.trim()),
          specializedSkills: formData.specializedSkills.split(',').map(s => s.trim()),
          availability: {
            days: formData.availableDays,
            hours: formData.availableHours,
            preferredLocation: formData.preferredLocation,
          }
        }
      }

      await register(registrationData)
      toast.success("Registration successful! Please verify your phone number")
      router.push('/verify-otp')
    } catch (error: any) {
      toast.error(error.message || "Failed to register")
    } finally {
      setIsLoading(false)
    }
  }, [formData, register, router, role])

  return (
    <div className="flex w-full justify-center items-center min-h-screen py-8 px-4 bg-white text-black dark:bg-black dark:text-white transition-colors">
      <div className="w-full border border-gray-800 max-w-md p-6 md:p-8 pb-12 space-y-6 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-blue-900/10">
        <div className="text-center py-4 space-y-2">
          <h1 className="text-4xl font-extrabold">ChildCare</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {role === 'admin' ? "Admin Registration" : 
             role === 'volunteer' ? "Volunteer Registration" : 
             "Parent Registration"}
          </p>
        </div>

        {/* Role selector */}
        <div className="flex justify-center gap-4">
          <Button
            variant={role === 'parent' ? "default" : "outline"}
            onClick={() => router.push('/register')}
            className="flex-1"
          >
            Parent
          </Button>
          <Button
            variant={role === 'volunteer' ? "default" : "outline"}
            onClick={() => router.push('/register?role=volunteer')}
            className="flex-1"
          >
            Volunteer
          </Button>
          <Button
            variant={role === 'admin' ? "default" : "outline"}
            onClick={() => router.push('/register?role=admin')}
            className="flex-1"
          >
            <Shield className="h-5 w-5 mr-2" />
            Admin
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Base user fields */}
          <Input
            name="name"
            type="text"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="bg-white dark:bg-gray-800"
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            required
            pattern="[0-9]{10}"
            value={formData.phone}
            onChange={handleInputChange}
            className="bg-white dark:bg-gray-800"
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="bg-white dark:bg-gray-800"
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="bg-white dark:bg-gray-800"
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="bg-white dark:bg-gray-800"
          />

          {/* Parent and Volunteer address fields */}
          {(role === 'parent' || role === 'volunteer') && (
            <>
              <h3 className="font-semibold text-lg pt-4">Address Information</h3>
              <div className="space-y-4">
                <Input
                  name="street"
                  type="text"
                  placeholder="Street Address"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  className="bg-white dark:bg-gray-800"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="city"
                    type="text"
                    placeholder="City"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-gray-800"
                  />
                  <Input
                    name="state"
                    type="text"
                    placeholder="State"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="zipCode"
                    type="text"
                    placeholder="ZIP Code"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-gray-800"
                  />
                  <Input
                    name="country"
                    type="text"
                    placeholder="Country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-gray-800"
                    disabled
                  />
                </div>
              </div>
            </>
          )}

          {/* Parent specific fields */}
          {role === 'parent' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg pt-4">Parent Information</h3>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* Volunteer specific fields */}
          {role === 'volunteer' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg pt-4">Volunteer Information</h3>
              <textarea
                name="qualifications"
                placeholder="Your Qualifications (comma-separated)"
                required
                value={formData.qualifications}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                rows={3}
              />
              <textarea
                name="specializedSkills"
                placeholder="Your Specialized Skills (comma-separated)"
                required
                value={formData.specializedSkills}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                rows={3}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.availableDays.includes(day) ? "default" : "outline"}
                      onClick={() => handleDayToggle(day)}
                      className="text-sm py-1"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Input
                name="availableHours"
                type="text"
                placeholder="Available Hours (e.g., 9 AM - 5 PM)"
                required
                value={formData.availableHours}
                onChange={handleInputChange}
                className="bg-white dark:bg-gray-800"
              />
              
              <Input
                name="preferredLocation"
                type="text"
                placeholder="Preferred Work Location (optional)"
                value={formData.preferredLocation}
                onChange={handleInputChange}
                className="bg-white dark:bg-gray-800"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href={`/login${role !== 'parent' ? `?role=${role}` : ''}`}
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
