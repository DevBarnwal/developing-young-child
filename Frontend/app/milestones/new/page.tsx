'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { milestoneService } from '@/lib/services/milestoneService'
import { childService } from '@/lib/services/childService'
import { Milestone, Child } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, ChevronLeft } from 'lucide-react'
import { LoadingSpinner, ButtonLoading } from '@/components/ui/loading'
import { FormError, FormErrorSummary } from '@/components/ui/form-error'
import { FormErrors, validateForm, hasErrors } from '@/lib/utils/validation'

export default function NewMilestonePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')
  
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState<'Motor' | 'Cognitive' | 'Language' | 'Social' | 'Emotional' | 'Other'>('Motor')
  const [description, setDescription] = useState('')
  const [ageInMonths, setAgeInMonths] = useState(0)
  const [isAchieved, setIsAchieved] = useState(false)
  const [achievedDate, setAchievedDate] = useState('')
  const [notes, setNotes] = useState('')
  
  // Form validation
  const [errors, setErrors] = useState<FormErrors<Milestone>>({})
  const [showErrors, setShowErrors] = useState(false)
  
  useEffect(() => {
    if (childId) {
      fetchChildDetails()
    } else {
      setLoading(false)
    }
  }, [childId])
  
  const fetchChildDetails = async () => {
    try {
      if (!childId) {
        toast.error('Child ID is required')
        router.push('/children')
        return
      }
      
      const response = await childService.getChildById(childId)
      if (response.success && response.data) {
        setChild(response.data)
        
        // Calculate default age based on child's current age
        const birthDate = new Date(response.data.dob)
        const now = new Date()
        let years = now.getFullYear() - birthDate.getFullYear()
        let months = now.getMonth() - birthDate.getMonth()
        
        if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
          years--
          months = 12 + months
        }
        
        setAgeInMonths(years * 12 + months)
      } else {
        toast.error('Failed to load child details')
        router.push('/children')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
      router.push('/children')
    } finally {
      setLoading(false)
    }
  }
    // Validate the form data
  const validateMilestoneForm = () => {
    const newErrors: FormErrors<Milestone> = validateForm<Milestone>({
      title,
      domain,
      ageInMonths,
      childId,
      description,
      isAchieved,
      achievedDate
    } as Milestone, {
      title: (value) => !value ? 'Title is required' : null,
      domain: (value) => !value ? 'Domain is required' : null,
      ageInMonths: (value) => {
        if (value === undefined || value === null) return 'Age is required';
        if (isNaN(Number(value))) return 'Age must be a number';
        if (Number(value) < 0) return 'Age must be a positive number';
        if (Number(value) > 72) return 'Age cannot be greater than 72 months (6 years)';
        return null;
      },
      achievedDate: (value) => {
        if (isAchieved && !value) return 'Please provide the achievement date';
        return null;
      }
    });
    
    setErrors(newErrors);
    return !hasErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate form
      if (!validateMilestoneForm()) {
        setShowErrors(true);
        return;
      }
      
      setSubmitting(true)
      
      if (!childId) {
        toast.error('Child ID is required')
        return
      }
      
      // Prepare milestone data
      const milestoneData: Partial<Milestone> = {
        childId: childId,
        title,
        domain,
        description,
        ageInMonths,
        isAchieved,
        notes
      }
      
      // Add achieved date if milestone is achieved
      if (isAchieved && achievedDate) {
        milestoneData.achievedDate = achievedDate
      }
      
      // Submit form
      const response = await milestoneService.createMilestone(milestoneData)
      
      if (response.success) {
        toast.success('Milestone created successfully')
        router.push(`/children/${childId}?tab=milestones`)
      } else {
        toast.error(response.message || 'Failed to create milestone')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }
    if (loading) {
    return (
      <div className="flex justify-center p-10">
        <LoadingSpinner text="Loading child information..." />
      </div>
    )
  }

  if (!childId) {
    return (
      <div className="text-center p-10">
        <p className="mb-4">Child ID is required to create a milestone</p>
        <Link href="/children" className="text-blue-500 hover:underline">
          Go to Children
        </Link>
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4"
          asChild
        >
          <Link href={`/children/${childId}?tab=milestones`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Child Profile
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold">Record New Milestone</h1>
        {child && (
          <p className="text-gray-500 dark:text-gray-400">
            For {child.name}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Rolls from back to side"
                className={errors.title ? "border-red-500" : ""}
                required
              />
              <FormError error={showErrors ? errors.title : undefined} />
            </div>
              <div>
              <label className="block text-sm font-medium mb-1" htmlFor="domain">
                Developmental Domain <span className="text-red-500">*</span>
              </label>
              <select
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className={`w-full rounded-md border ${errors.domain ? "border-red-500" : "border-gray-300 dark:border-gray-700"} px-3 py-2 bg-transparent`}
                required
              >
                <option value="Motor">Motor</option>
                <option value="Cognitive">Cognitive</option>
                <option value="Language">Language</option>
                <option value="Social">Social</option>
                <option value="Emotional">Emotional</option>
                <option value="Other">Other</option>
              </select>
              <FormError error={showErrors ? errors.domain : undefined} />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                placeholder="Describe the milestone..."
              />
            </div>
              <div>
              <label className="block text-sm font-medium mb-1" htmlFor="ageInMonths">
                Expected Age (in months) <span className="text-red-500">*</span>
              </label>
              <Input
                id="ageInMonths"
                type="number"
                min={0}
                max={72}
                value={ageInMonths}
                onChange={(e) => setAgeInMonths(parseInt(e.target.value) || 0)}
                className={errors.ageInMonths ? "border-red-500" : ""}
                required
              />
              <FormError error={showErrors ? errors.ageInMonths : undefined} />
              {!errors.ageInMonths && (
                <p className="text-sm text-gray-500 mt-1">
                  Typically achieved around {Math.floor(ageInMonths / 12)} years, {ageInMonths % 12} months
                </p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="isAchieved"
                type="checkbox"
                checked={isAchieved}
                onChange={(e) => setIsAchieved(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isAchieved" className="ml-2 block text-sm">
                Already achieved
              </label>
            </div>
            
            {isAchieved && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="achievedDate">
                  Date Achieved
                </label>
                <Input
                  id="achievedDate"
                  type="date"
                  value={achievedDate}
                  onChange={(e) => setAchievedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                placeholder="Any additional notes about this milestone..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/children/${childId}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Milestone'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
