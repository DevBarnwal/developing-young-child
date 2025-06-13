'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { milestoneService } from '@/lib/services/milestoneService'
import { Milestone } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function EditMilestonePage() {
  const router = useRouter()
  const { id } = useParams()
  
  const [milestone, setMilestone] = useState<Milestone | null>(null)
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
  
  useEffect(() => {
    if (id) {
      fetchMilestoneDetails(id as string)
    }
  }, [id])
  
  const fetchMilestoneDetails = async (milestoneId: string) => {
    try {
      setLoading(true)
      const response = await milestoneService.getMilestoneById(milestoneId)
      
      if (response.success && response.data) {
        const milestoneData = response.data
        setMilestone(milestoneData)
        
        // Populate form fields
        setTitle(milestoneData.title)
        setDomain(milestoneData.domain)
        setDescription(milestoneData.description)
        setAgeInMonths(milestoneData.ageInMonths)
        setIsAchieved(milestoneData.isAchieved)
        
        if (milestoneData.achievedDate) {
          // Format date for date input (YYYY-MM-DD)
          const date = new Date(milestoneData.achievedDate)
          setAchievedDate(date.toISOString().split('T')[0])
        }
        
        setNotes(milestoneData.notes || '')
      } else {
        toast.error('Failed to load milestone details')
        router.push('/children')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
      router.push('/children')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      if (!milestone) {
        toast.error('Milestone not found')
        return
      }
      
      // Validate form
      if (!title) {
        toast.error('Title is required')
        return
      }
      
      if (!domain) {
        toast.error('Domain is required')
        return
      }
      
      if (ageInMonths < 0) {
        toast.error('Age must be a positive number')
        return
      }
      
      // Prepare milestone data
      const milestoneData: Partial<Milestone> = {
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
      const response = await milestoneService.updateMilestone(milestone._id, milestoneData)
      
      if (response.success) {
        toast.success('Milestone updated successfully')
        
        // Get the childId from the milestone to redirect back to the child's page
        const childId = typeof milestone.childId === 'string' 
          ? milestone.childId 
          : milestone.childId._id
        
        router.push(`/children/${childId}?tab=milestones`)
      } else {
        toast.error(response.message || 'Failed to update milestone')
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }
  
  if (!milestone) {
    return (
      <div className="text-center p-10">
        <p className="mb-4">Milestone not found</p>
        <Button asChild>
          <Link href="/children">Go to Children</Link>
        </Button>
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
          <Link href={`/children/${
            typeof milestone.childId === 'string' 
              ? milestone.childId 
              : (milestone.childId as any)._id
          }?tab=milestones`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Child Profile
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold">Edit Milestone</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {title}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Rolls from back to side"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="domain">
                Developmental Domain <span className="text-red-500">*</span>
              </label>
              <select
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                required
              >
                <option value="Motor">Motor</option>
                <option value="Cognitive">Cognitive</option>
                <option value="Language">Language</option>
                <option value="Social">Social</option>
                <option value="Emotional">Emotional</option>
                <option value="Other">Other</option>
              </select>
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
                onChange={(e) => setAgeInMonths(parseInt(e.target.value))}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Typically achieved around {Math.floor(ageInMonths / 12)} years, {ageInMonths % 12} months
              </p>
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
                onClick={() => router.push(`/children/${
                  typeof milestone.childId === 'string' 
                    ? milestone.childId 
                    : (milestone.childId as any)._id
                }?tab=milestones`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
