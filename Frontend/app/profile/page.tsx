'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // Parent profile fields
    parentPhone: user?.parentProfile?.phone || '',
    parentAddress: user?.parentProfile?.address || '',
    // Volunteer profile fields
    volunteerPhone: user?.volunteerProfile?.phone || '',
    volunteerExperience: user?.volunteerProfile?.experience || '',
    volunteerAvailability: user?.volunteerProfile?.availability || '',
    volunteerSpecialties: user?.volunteerProfile?.specialties?.join(', ') || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare the data based on user role
      const profileData: any = {
        name: formData.name,
      }

      if (user?.role === 'parent') {
        profileData.parentProfile = {
          phone: formData.parentPhone,
          address: formData.parentAddress,
        }
      } else if (user?.role === 'volunteer') {
        profileData.volunteerProfile = {
          phone: formData.volunteerPhone,
          experience: formData.volunteerExperience,
          availability: formData.volunteerAvailability,
          specialties: formData.volunteerSpecialties.split(',').map(s => s.trim()),
        }
      }

      await updateProfile(user!.id, profileData)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email address cannot be changed. Contact support for assistance.
            </p>
          </div>
          
          {user?.role === 'parent' && (
            <>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Parent Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="parentPhone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="parentPhone"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="parentAddress" className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <Input
                      id="parentAddress"
                      name="parentAddress"
                      value={formData.parentAddress}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {user?.role === 'volunteer' && (
            <>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Volunteer Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="volunteerPhone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="volunteerPhone"
                      name="volunteerPhone"
                      value={formData.volunteerPhone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="volunteerExperience" className="block text-sm font-medium mb-1">
                      Experience
                    </label>
                    <textarea
                      id="volunteerExperience"
                      name="volunteerExperience"
                      value={formData.volunteerExperience}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="volunteerAvailability" className="block text-sm font-medium mb-1">
                      Availability
                    </label>
                    <Input
                      id="volunteerAvailability"
                      name="volunteerAvailability"
                      value={formData.volunteerAvailability}
                      onChange={handleChange}
                      placeholder="e.g. Weekends, Monday evenings"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="volunteerSpecialties" className="block text-sm font-medium mb-1">
                      Specialties (comma separated)
                    </label>
                    <Input
                      id="volunteerSpecialties"
                      name="volunteerSpecialties"
                      value={formData.volunteerSpecialties}
                      onChange={handleChange}
                      placeholder="e.g. Special needs, Early childhood, Language development"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
