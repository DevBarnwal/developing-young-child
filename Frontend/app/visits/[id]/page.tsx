'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { visitService } from '@/lib/services/visitService'
import { milestoneService } from '@/lib/services/milestoneService'
import { childService } from '@/lib/services/childService'
import { Visit, Child, Milestone } from '@/lib/types/models'
import { useAuth } from '@/lib/contexts/AuthContext'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  ChevronLeft, 
  Edit, 
  User,
  AlignLeft,
  CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

export default function VisitDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const { user } = useAuth()
  
  const [visit, setVisit] = useState<Visit | null>(null)
  const [child, setChild] = useState<Child | null>(null)
  const [loadingVisit, setLoadingVisit] = useState(true)
  const [loadingChild, setLoadingChild] = useState(true)
  const [milestones, setMilestones] = useState<{[key: string]: Milestone}>({})
  const [loadingMilestones, setLoadingMilestones] = useState(true)
  
  useEffect(() => {
    if (id) {
      fetchVisitDetails(id as string)
    }
  }, [id])
  
  const fetchVisitDetails = async (visitId: string) => {
    try {
      setLoadingVisit(true)
      const response = await visitService.getVisitById(visitId)
      
      if (response.success && response.data) {
        setVisit(response.data)
        
        // Load child data
        if (typeof response.data.childId === 'string') {
          fetchChildDetails(response.data.childId)
        } else {
          setChild(response.data.childId as Child)
          setLoadingChild(false)
          
          // Load milestone data if child is available
          fetchMilestones((response.data.childId as Child)._id)
        }
      } else {
        toast.error('Failed to load visit details')
        router.push('/visits')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
      router.push('/visits')
    } finally {
      setLoadingVisit(false)
    }
  }
  
  const fetchChildDetails = async (childId: string) => {
    try {
      setLoadingChild(true)
      const response = await childService.getChildById(childId)
      
      if (response.success && response.data) {
        setChild(response.data)
        
        // Load milestone data now that we have the child
        fetchMilestones(response.data._id)
      } else {
        toast.error('Failed to load child details')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoadingChild(false)
    }
  }
  
  const fetchMilestones = async (childId: string) => {
    try {
      setLoadingMilestones(true)
      const response = await milestoneService.getMilestonesByChild(childId)
      
      if (response.success && response.data) {
        // Convert array to object with milestone IDs as keys for easy lookup
        const milestonesObject: {[key: string]: Milestone} = {}
        response.data.forEach(milestone => {
          milestonesObject[milestone._id] = milestone
        })
        
        setMilestones(milestonesObject)
      }
    } catch (error: any) {
      console.error('Failed to load milestones', error)
    } finally {
      setLoadingMilestones(false)
    }
  }
  
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (loadingVisit || loadingChild) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }
  
  if (!visit || !child) {
    return (
      <div className="text-center p-10">
        <p className="mb-4">Visit not found</p>
        <Link href="/visits" className="text-blue-500 hover:underline">
          Back to Visits
        </Link>
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
          <Link href="/visits">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Visits
          </Link>
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-1">
              <Link 
                href={`/children/${
                  typeof child._id === 'string' ? child._id : child.id
                }`}
                className="text-blue-500 hover:underline mr-2"
              >
                {child.name}
              </Link>
              <span className="text-gray-500">•</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                Visit on {formatDate(visit.visitDate)}
              </span>
            </div>
            <h1 className="text-2xl font-bold">Visit Record</h1>
          </div>
          
          {(user?.role === 'parent' || user?.role === 'admin') && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href={`/visits/${visit._id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Visit
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visit details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-medium mb-4">Visit Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="flex space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p>{formatDate(visit.visitDate)}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p>{visit.duration} minutes</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p>{visit.location}</p>
                  {visit.locationDetails && <p className="text-sm">{visit.locationDetails}</p>}
                </div>
              </div>
              
              {visit.nextVisitDate && (
                <div className="flex space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Next Visit Scheduled</p>
                    <p>{formatDate(visit.nextVisitDate)}</p>
                  </div>
                </div>
              )}
            </div>
            
            {visit.volunteerId && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Volunteer</p>
                    <p>
                      {typeof visit.volunteerId === 'string' 
                        ? 'Volunteer' 
                        : visit.volunteerId.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Activities conducted */}
          {visit.activitiesConducted && visit.activitiesConducted.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-medium mb-4">Activities Conducted</h2>
              
              <div className="space-y-4">
                {visit.activitiesConducted.map((activity, index) => (
                  <div key={index} className="border-l-4 border-blue-400 dark:border-blue-600 pl-4 py-2">
                    <h3 className="font-medium">{activity.title}</h3>
                    {activity.domain && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
                          {activity.domain}
                        </span>
                        {activity.duration && (
                          <span className="text-xs text-gray-500 ml-2">
                            {activity.duration} mins
                          </span>
                        )}
                      </div>
                    )}
                    {activity.description && (
                      <p className="text-sm mt-2">{activity.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Milestone assessments */}
          {visit.milestonesAssessed && visit.milestonesAssessed.length > 0 && !loadingMilestones && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-medium mb-4">Milestones Assessed</h2>
              
              <div className="space-y-4">
                {visit.milestonesAssessed.map((assessment, index) => {
                  // Get the milestone details from our loaded milestones
                  const milestoneId = typeof assessment.milestoneId === 'string' 
                    ? assessment.milestoneId 
                    : assessment.milestoneId._id
                    
                  const milestone = milestones[milestoneId]
                  
                  return (
                    <div 
                      key={index}
                      className={`border-l-4 ${
                        assessment.status === 'Achieved' 
                          ? 'border-green-400 dark:border-green-600'
                          : assessment.status === 'In Progress'
                            ? 'border-yellow-400 dark:border-yellow-600'
                            : 'border-gray-400 dark:border-gray-600'
                      } pl-4 py-2`}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">
                          {milestone 
                            ? milestone.title 
                            : 'Unknown milestone'}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          assessment.status === 'Achieved'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                            : assessment.status === 'In Progress'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                        }`}>
                          {assessment.status}
                        </span>
                      </div>
                      
                      {milestone && (
                        <p className="text-sm text-gray-500 mt-1">
                          {milestone.domain} • Expected around {milestone.ageInMonths} months
                        </p>
                      )}
                      
                      {assessment.notes && (
                        <p className="text-sm mt-2">{assessment.notes}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes and recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            {visit.notes && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <AlignLeft className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-md font-medium">Visit Notes</h3>
                </div>
                <p className="whitespace-pre-wrap">{visit.notes}</p>
              </div>
            )}
            
            {visit.recommendations && (
              <div>
                <div className="flex items-center mb-3">
                  <CheckSquare className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-md font-medium">Recommendations</h3>
                </div>
                <p className="whitespace-pre-wrap">{visit.recommendations}</p>
              </div>
            )}
            
            {!visit.notes && !visit.recommendations && (
              <div className="text-center py-6 text-gray-500">
                No notes or recommendations recorded for this visit.
              </div>
            )}
          </div>
          
          {/* Child info summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-md font-medium mb-3">Child Information</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p>{child.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Age at Visit</p>
                <p>
                  {(() => {
                    const birthDate = new Date(child.dob)
                    const visitDate = new Date(visit.visitDate)
                    
                    let years = visitDate.getFullYear() - birthDate.getFullYear()
                    let months = visitDate.getMonth() - birthDate.getMonth()
                    
                    if (months < 0 || (months === 0 && visitDate.getDate() < birthDate.getDate())) {
                      years--
                      months = 12 + months
                    }
                    
                    return years > 0 
                      ? `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`
                      : `${months} month${months !== 1 ? 's' : ''}`
                  })()}
                </p>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  asChild
                >
                  <Link href={`/children/${typeof child._id === 'string' ? child._id : child.id}`}>
                    View Child Profile
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
