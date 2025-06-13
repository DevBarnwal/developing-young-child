'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { activityService } from '@/lib/services/activityService'
import { Activity } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { ChevronLeft, Plus, Minus, Loader2 } from 'lucide-react'

export default function EditActivityPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activity, setActivity] = useState<Activity | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState<string>('Motor')
  const [ageRangeMin, setAgeRangeMin] = useState(0)
  const [ageRangeMax, setAgeRangeMax] = useState(12)
  const [instructions, setInstructions] = useState('')
  const [materials, setMaterials] = useState<string[]>([''])
  const [benefits, setBenefits] = useState<string[]>([''])
  const [duration, setDuration] = useState<number | undefined>(undefined)
  const [difficultyLevel, setDifficultyLevel] = useState<string>('Medium')
  const [tags, setTags] = useState<string[]>([''])
  const [language, setLanguage] = useState('English')
  const [isApproved, setIsApproved] = useState(true)

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/activities')
      toast.error("You don't have permission to access this page")
    } else {
      fetchActivity()
    }
  }, [user, router, id])

  const fetchActivity = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const response = await activityService.getActivityById(id as string)
      
      if (response.success && response.data) {
        const activityData = response.data
        setActivity(activityData)
        
        // Populate form fields
        setTitle(activityData.title)
        setDescription(activityData.description)
        setDomain(activityData.domain)
        setAgeRangeMin(activityData.ageRange.min)
        setAgeRangeMax(activityData.ageRange.max)
        setInstructions(activityData.instructions)
        setMaterials(activityData.materials?.length ? activityData.materials : [''])
        setBenefits(activityData.benefits?.length ? activityData.benefits : [''])
        setDuration(activityData.duration)
        setDifficultyLevel(activityData.difficultyLevel || 'Medium')
        setTags(activityData.tags?.length ? activityData.tags : [''])
        setLanguage(activityData.language || 'English')
        setIsApproved(activityData.isApproved)
      } else {
        toast.error('Failed to load activity')
        router.push('/admin/activities')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
      router.push('/admin/activities')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = (
    currentItems: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setItems([...currentItems, ''])
  }

  const handleRemoveItem = (
    index: number,
    currentItems: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newItems = [...currentItems]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleItemChange = (
    index: number,
    value: string,
    currentItems: string[],
    setItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newItems = [...currentItems]
    newItems[index] = value
    setItems(newItems)
  }

  const validateForm = () => {
    if (!title) {
      toast.error('Title is required')
      return false
    }
    if (!description) {
      toast.error('Description is required')
      return false
    }
    if (!instructions) {
      toast.error('Instructions are required')
      return false
    }
    if (ageRangeMin >= ageRangeMax) {
      toast.error('Age range is invalid')
      return false
    }
    
    // Filter out empty items
    const filteredMaterials = materials.filter(item => item.trim() !== '')
    const filteredBenefits = benefits.filter(item => item.trim() !== '')
    const filteredTags = tags.filter(item => item.trim() !== '')
    
    setMaterials(filteredMaterials)
    setBenefits(filteredBenefits)
    setTags(filteredTags)
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !activity) {
      return
    }

    try {
      setSubmitting(true)

      // Filter out empty items
      const filteredMaterials = materials.filter(item => item.trim() !== '')
      const filteredBenefits = benefits.filter(item => item.trim() !== '')
      const filteredTags = tags.filter(item => item.trim() !== '')

      const activityData: Partial<Activity> = {
        title,
        description,
        domain: domain as Activity['domain'],
        ageRange: {
          min: ageRangeMin,
          max: ageRangeMax
        },
        instructions,
        materials: filteredMaterials.length > 0 ? filteredMaterials : undefined,
        benefits: filteredBenefits.length > 0 ? filteredBenefits : undefined,
        duration: duration || undefined,
        difficultyLevel: difficultyLevel as Activity['difficultyLevel'],
        tags: filteredTags.length > 0 ? filteredTags : undefined,
        language,
        isApproved
      }

      const response = await activityService.updateActivity(activity._id, activityData)

      if (response.success) {
        toast.success('Activity updated successfully')
        
        // Go back to activity details or admin page
        if (user?.role === 'admin') {
          router.push('/admin/activities')
        } else {
          router.push(`/activities/${activity._id}`)
        }
      } else {
        toast.error(response.message || 'Failed to update activity')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (user?.role !== 'admin') {
    return null // Don't render anything while redirecting
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 size={40} className="animate-spin mb-4 text-gray-400" />
        <p className="text-gray-500">Loading activity...</p>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Activity not found</h2>
        <p className="mb-6 text-gray-500">
          The activity you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/admin/activities">Back to Activities</Link>
        </Button>
      </div>
    )
  }

  const domains = ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other']
  const difficultyLevels = ['Easy', 'Medium', 'Hard']

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4"
        asChild
      >
        <Link href={user?.role === 'admin' ? '/admin/activities' : `/activities/${activity._id}`}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-1">Edit Activity</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Update details for: {activity.title}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic information */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Stacking Blocks"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of the activity"
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium mb-1">
                  Developmental Domain <span className="text-red-500">*</span>
                </label>
                <select
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
                  required
                >
                  {domains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
                >
                  {difficultyLevels.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={duration || ''}
                  onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 15"
                />
              </div>
              
              <div>
                <label htmlFor="ageRangeMin" className="block text-sm font-medium mb-1">
                  Min Age (months) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="ageRangeMin"
                  type="number"
                  min={0}
                  max={72}
                  value={ageRangeMin}
                  onChange={(e) => setAgeRangeMin(parseInt(e.target.value))}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="ageRangeMax" className="block text-sm font-medium mb-1">
                  Max Age (months) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="ageRangeMax"
                  type="number"
                  min={0}
                  max={72}
                  value={ageRangeMax}
                  onChange={(e) => setAgeRangeMax(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Age range: {Math.floor(ageRangeMin / 12)} year{ageRangeMin >= 12 && ageRangeMin < 24 ? '' : 's'}, {ageRangeMin % 12} month{ageRangeMin % 12 !== 1 ? 's' : ''} to {Math.floor(ageRangeMax / 12)} year{ageRangeMax >= 12 && ageRangeMax < 24 ? '' : 's'}, {ageRangeMax % 12} month{ageRangeMax % 12 !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Instructions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4">Instructions</h2>
            
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium mb-1">
                Activity Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Step-by-step instructions for the activity"
                rows={6}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Materials */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4">Materials</h2>
            
            {materials.map((material, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input
                  value={material}
                  onChange={(e) => handleItemChange(index, e.target.value, materials, setMaterials)}
                  placeholder={`Material ${index + 1}`}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveItem(index, materials, setMaterials)}
                  disabled={materials.length === 1 && index === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddItem(materials, setMaterials)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>

          {/* Benefits */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4">Benefits</h2>
            
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input
                  value={benefit}
                  onChange={(e) => handleItemChange(index, e.target.value, benefits, setBenefits)}
                  placeholder={`Benefit ${index + 1}`}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveItem(index, benefits, setBenefits)}
                  disabled={benefits.length === 1 && index === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddItem(benefits, setBenefits)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>
          </div>

          {/* Tags and language */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium mb-4">Additional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium mb-1">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="approval" className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  id="approval"
                  value={isApproved ? "approved" : "pending"}
                  onChange={(e) => setIsApproved(e.target.value === "approved")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
                >
                  <option value="approved">Approved (Published)</option>
                  <option value="pending">Pending Approval (Draft)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tags
              </label>
              
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    value={tag}
                    onChange={(e) => handleItemChange(index, e.target.value, tags, setTags)}
                    placeholder={`Tag ${index + 1}`}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveItem(index, tags, setTags)}
                    disabled={tags.length === 1 && index === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddItem(tags, setTags)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
