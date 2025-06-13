'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { childService } from '@/lib/services/childService'
import { visitService } from '@/lib/services/visitService'
import { Child } from '@/lib/types/models'
import { Visit, VisitActivity, ActivityDomain } from '@/lib/types/visit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ChevronLeft, Plus, Minus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { validateVisitForm, VisitFormData } from '@/lib/validation/visit'

// Constant options
const domainOptions: ActivityDomain[] = ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other']
const locationOptions = ['Home', 'Center', 'School', 'Other'] as const

export default function NewVisitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')
  const { user } = useAuth()
  
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, any>>({})
  
  const [formData, setFormData] = useState<VisitFormData>({
    childId: childId || '',
    visitDate: new Date().toISOString().split('T')[0],
    duration: 60,
    location: 'Home',
    locationDetails: '',
    notes: '',
    recommendations: '',
    nextVisitDate: '',
    activities: [{ title: '', description: '', domain: 'Cognitive', duration: 15 }]
  })

  // Reset errors when form data changes
  useEffect(() => {
    setErrors({})
  }, [formData])

  // Load children on component mount
  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      setLoading(true)
      const response = await childService.getChildren()
      
      if (response.success) {
        setChildren(response.data || [])
      } else {
        toast.error('Failed to load children')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'location' ? value as typeof prev.location : value 
    }))
  }
  
  const handleActivityChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const activities = [...prev.activities]
      activities[index] = { 
        ...activities[index], 
        [field]: field === 'domain' ? value as ActivityDomain : value 
      }
      return { ...prev, activities }
    })
  }
  
  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { title: '', description: '', domain: 'Cognitive' as ActivityDomain, duration: 15 }
      ]
    }))
  }
  
  const removeActivity = (index: number) => {
    if (formData.activities.length === 1) return
    
    setFormData(prev => {
      const activities = prev.activities.filter((_, i) => i !== index)
      return { ...prev, activities }
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateVisitForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      const firstError = Object.values(validation.errors)[0]
      toast.error(typeof firstError === 'string' ? firstError : 'Please fix the errors in the form')
      return
    }
    
    try {
      setSubmitting(true)
      
      const visitData: Partial<Visit> = {
        ...formData,
        volunteerId: user?.id,
        // Only include activities that have a title
        activitiesConducted: formData.activities
          .filter(a => a.title.trim())
          .map(a => ({
            title: a.title,
            description: a.description,
            domain: a.domain,
            duration: a.duration
          }))
      }
      
      const response = await visitService.createVisit(visitData)
      
      if (response.success) {
        toast.success('Visit record created successfully')
        router.push('/visits')
      } else {
        toast.error(response.message || 'Failed to create visit record')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create visit record')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/visits" className="text-sm text-blue-500 hover:underline flex items-center">
            <ChevronLeft size={16} className="mr-1" />
            Back to Visits
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold">New Visit Record</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child selection */}
          <div>
            <label htmlFor="childId" className="block text-sm font-medium mb-1">
              Child <span className="text-red-500">*</span>
            </label>
            <select
              id="childId"
              name="childId"
              value={formData.childId}
              onChange={handleChange}
              className={cn(
                "w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent",
                errors.childId && "border-red-500 dark:border-red-500"
              )}
              required
            >
              <option value="">Select a child</option>
              {children.map(child => (
                <option key={child._id} value={child._id}>
                  {child.name}
                </option>
              ))}
            </select>
            {errors.childId && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                <AlertCircle size={14} />
                <span>{errors.childId}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="visitDate" className="block text-sm font-medium mb-1">
                Visit Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="visitDate"
                name="visitDate"
                type="date"
                value={formData.visitDate}
                onChange={handleChange}
                className={cn(
                  errors.visitDate && "border-red-500 dark:border-red-500"
                )}
                required
              />
              {errors.visitDate && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                  <AlertCircle size={14} />
                  <span>{errors.visitDate}</span>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-1">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                className={cn(
                  errors.duration && "border-red-500 dark:border-red-500"
                )}
                required
              />
              {errors.duration && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                  <AlertCircle size={14} />
                  <span>{errors.duration}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={cn(
                  "w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent",
                  errors.location && "border-red-500 dark:border-red-500"
                )}
                required
              >
                {locationOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.location && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                  <AlertCircle size={14} />
                  <span>{errors.location}</span>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="locationDetails" className="block text-sm font-medium mb-1">
                Location Details {formData.location === 'Other' && <span className="text-red-500">*</span>}
              </label>
              <Input
                id="locationDetails"
                name="locationDetails"
                value={formData.locationDetails}
                onChange={handleChange}
                placeholder={formData.location === 'Other' ? 'Please specify location' : 'Optional details about location'}
                className={cn(
                  errors.locationDetails && "border-red-500 dark:border-red-500"
                )}
                required={formData.location === 'Other'}
              />
              {errors.locationDetails && (
                <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                  <AlertCircle size={14} />
                  <span>{errors.locationDetails}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Activities Conducted</h3>
            
            <div className="space-y-4">
              {formData.activities.map((activity, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium">Activity {index + 1}</h4>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeActivity(index)}
                      disabled={formData.activities.length === 1}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                    >
                      <Minus size={16} />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={activity.title}
                        onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                        placeholder="e.g. Building blocks activity"
                        className={cn(
                          errors.activities?.[index]?.title && "border-red-500 dark:border-red-500"
                        )}
                      />
                      {errors.activities?.[index]?.title && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <AlertCircle size={14} />
                          <span>{errors.activities[index].title}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Domain <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={activity.domain}
                          onChange={(e) => handleActivityChange(index, 'domain', e.target.value)}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                        >
                          {domainOptions.map(option => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Duration (minutes) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={activity.duration}
                          onChange={(e) => handleActivityChange(index, 'duration', parseInt(e.target.value))}
                          className={cn(
                            errors.activities?.[index]?.duration && "border-red-500 dark:border-red-500"
                          )}
                        />
                        {errors.activities?.[index]?.duration && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                            <AlertCircle size={14} />
                            <span>{errors.activities[index].duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={activity.description}
                        onChange={(e) => handleActivityChange(index, 'description', e.target.value)}
                        placeholder="Describe the activity and how the child engaged with it"
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addActivity}
                className="w-full"
              >
                <Plus size={16} className="mr-2" /> Add Another Activity
              </Button>
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Visit Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
              rows={4}
              placeholder="General notes about the visit, child's behavior, engagement, etc."
            />
          </div>
          
          <div>
            <label htmlFor="recommendations" className="block text-sm font-medium mb-1">
              Recommendations
            </label>
            <textarea
              id="recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
              rows={3}
              placeholder="Recommendations for future activities, areas to focus on, etc."
            />
          </div>
          
          <div>
            <label htmlFor="nextVisitDate" className="block text-sm font-medium mb-1">
              Next Visit Date (Optional)
            </label>
            <Input
              id="nextVisitDate"
              name="nextVisitDate"
              type="date"
              value={formData.nextVisitDate}
              onChange={handleChange}
              className={cn(
                errors.nextVisitDate && "border-red-500 dark:border-red-500"
              )}
            />
            {errors.nextVisitDate && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                <AlertCircle size={14} />
                <span>{errors.nextVisitDate}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/visits')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className={cn(
                submitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {submitting ? 'Saving...' : 'Save Visit Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}