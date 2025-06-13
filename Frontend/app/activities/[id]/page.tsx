'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Activity } from '@/lib/types/models'
import { activityService } from '@/lib/services/activityService'
import { useAuth } from '@/lib/contexts/AuthContext'
import { 
  Clock, 
  Calendar, 
  Tag, 
  BarChart, 
  ChevronLeft, 
  Edit, 
  Trash2, 
  Check, 
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ActivityDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  useEffect(() => {
    if (id) {
      fetchActivity(id as string)
    }
  }, [id])
  
  const fetchActivity = async (activityId: string) => {
    try {
      setLoading(true)
      const response = await activityService.getActivityById(activityId)
      if (response.success && response.data) {
        setActivity(response.data)
      } else {
        toast.error('Failed to load activity details')
        router.push('/activities')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
      router.push('/activities')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    try {
      setDeleting(true)
      // Soft delete the activity
      const response = await activityService.updateActivity(activity?._id!, { isDeleted: true })
      if (response.success) {
        toast.success('Activity deleted successfully')
        router.push('/activities')
      } else {
        toast.error('Failed to delete activity')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }
  
  const getDomainColor = (domain: string) => {
    switch(domain) {
      case 'Motor': return 'bg-red-500';
      case 'Cognitive': return 'bg-blue-500';
      case 'Language': return 'bg-green-500';
      case 'Social': return 'bg-purple-500';
      case 'Emotional': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }
  
  const getDomainTextColor = (domain: string) => {
    switch(domain) {
      case 'Motor': return 'text-red-500';
      case 'Cognitive': return 'text-blue-500';
      case 'Language': return 'text-green-500';
      case 'Social': return 'text-purple-500';
      case 'Emotional': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  }
  
  const getDifficultyBadge = (level?: string) => {
    if (!level) return null;
    
    switch(level) {
      case 'Easy': 
        return <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs">
          Easy
        </span>;
      case 'Medium': 
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full text-xs">
          Medium
        </span>;
      case 'Hard': 
        return <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-xs">
          Hard
        </span>;
      default: return null;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }
  
  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <X size={48} className="mb-4 text-gray-400" />
        <h2 className="text-xl font-medium mb-2">Activity Not Found</h2>
        <p className="text-gray-500 mb-6">The activity you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/activities">Go Back to Activities</Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4"
          asChild
        >
          <Link href="/activities">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Activities
          </Link>
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getDomainColor(activity.domain)}`} />
              <h1 className="text-2xl font-bold">{activity.title}</h1>
              {getDifficultyBadge(activity.difficultyLevel)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className={`font-medium ${getDomainTextColor(activity.domain)}`}>
                {activity.domain}
              </span>
              <span>•</span>
              <span>Age: {activity.ageRange.min}-{activity.ageRange.max} months ({Math.floor(activity.ageRange.min/12)}-{Math.floor(activity.ageRange.max/12)} years)</span>
            </div>
          </div>
          
          {/* Admin actions */}
          {user?.role === 'admin' && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/activities/edit/${activity._id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {deleting ? 'Deleting...' : 'Confirm'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About This Activity</CardTitle>
              <CardDescription>Description and instructions for this developmental activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{activity.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Instructions</h3>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {activity.instructions}
                  </div>
                </div>
                
                {activity.benefits && activity.benefits.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Benefits</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {activity.benefits.map((benefit, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activity.duration && (
                  <li className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p>{activity.duration} minutes</p>
                    </div>
                  </li>
                )}
                
                {activity.materials && activity.materials.length > 0 && (
                  <li className="flex">
                    <BarChart className="h-5 w-5 mr-3 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Materials Needed</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {activity.materials.map((material, index) => (
                          <li key={index}>{material}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )}
                
                {activity.tags && activity.tags.length > 0 && (
                  <li className="flex">
                    <Tag className="h-5 w-5 mr-3 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Tags</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activity.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                )}
                
                {activity.language && (
                  <li className="flex items-center">
                    <div className="h-5 w-5 mr-3 text-gray-500 flex items-center justify-center text-xs font-medium">
                      {activity.language.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Language</p>
                      <p>{activity.language}</p>
                    </div>
                  </li>
                )}
                
                <li className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p>{new Date(activity.createdAt).toLocaleDateString()}</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-medium mb-2">Share This Activity</h3>
                <p className="text-sm text-gray-500 mb-4">Send this activity to parents or colleagues</p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}>
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
