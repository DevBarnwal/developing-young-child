'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { childService } from '@/lib/services/childService'
import { milestoneService } from '@/lib/services/milestoneService'
import { visitService } from '@/lib/services/visitService'
import { Child, Milestone, Visit } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { Plus, Calendar, ChevronRight } from 'lucide-react'

export default function ChildDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [child, setChild] = useState<Child | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Load child data, milestones, and visits on component mount
  useEffect(() => {
    fetchChildDetails()
  }, [params.id])
  
  const fetchChildDetails = async () => {
    try {
      setLoading(true)
      
      // Get child details
      const childResponse = await childService.getChildById(params.id)
      if (childResponse.success && childResponse.data) {
        setChild(childResponse.data)
      } else {
        toast.error('Failed to load child details')
        return
      }
      
      // Get milestones
      const milestonesResponse = await milestoneService.getMilestonesByChild(params.id)
      if (milestonesResponse.success && milestonesResponse.data) {
        setMilestones(milestonesResponse.data)
      }
      
      // Get visits
      const visitsResponse = await visitService.getVisitsByChild(params.id)
      if (visitsResponse.success && visitsResponse.data) {
        setVisits(visitsResponse.data)
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const calculateAge = (dob: string | Date): string => {
    const birthDate = new Date(dob)
    const now = new Date()
    
    let years = now.getFullYear() - birthDate.getFullYear()
    let months = now.getMonth() - birthDate.getMonth()
    
    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--
      months = 12 + months
    }
    
    // Calculate total months for developmental comparison
    const totalMonths = years * 12 + months
    
    return years > 0 
      ? `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} (${totalMonths} months)`
      : `${months} month${months !== 1 ? 's' : ''}`
  }
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }
  
  if (!child) {
    return <div className="p-10 text-center">Child not found</div>
  }
  
  return (
    <div>
      {/* Child header info */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/children" className="text-sm text-blue-500 hover:underline">
            Children
          </Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-sm">{child.name}</span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{child.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Age: {calculateAge(child.dob)}
            </p>
          </div>
          
          {(user?.role === 'admin' || user?.role === 'parent') && (
            <Link href={`/visits/new?childId=${child._id}`}>
              <Button>
                <Plus size={16} className="mr-2" />
                New Visit
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-1 border-b-2 ${
              activeTab === 'milestones'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Milestones
          </button>
          <button
            onClick={() => setActiveTab('visits')}
            className={`py-3 px-1 border-b-2 ${
              activeTab === 'visits'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Visit History
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-500 dark:text-gray-400 w-32">Full Name:</span>
                    <span>{child.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 dark:text-gray-400 w-32">Date of Birth:</span>
                    <span>{formatDate(child.dob)}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 dark:text-gray-400 w-32">Gender:</span>
                    <span>{child.gender}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 dark:text-gray-400 w-32">Age:</span>
                    <span>{calculateAge(child.dob)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Development Details</h3>
                {child.specialNeeds && (
                  <div className="mb-3">
                    <span className="block text-gray-500 dark:text-gray-400 mb-1">Special Needs:</span>
                    <p>{child.specialNeeds}</p>
                  </div>
                )}
                {child.developmentalNotes && (
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400 mb-1">Developmental Notes:</span>
                    <p>{child.developmentalNotes}</p>
                  </div>
                )}
                {!child.specialNeeds && !child.developmentalNotes && (
                  <p className="text-gray-500 dark:text-gray-400">No developmental notes recorded.</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
              {visits.length > 0 ? (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Last visit: {formatDate(visits[0].visitDate)}
                  </div>
                  <p>
                    {child.name} has had {visits.length} visit{visits.length !== 1 ? 's' : ''}.
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No visits recorded yet.</p>
              )}
            </div>
          </div>
        )}
        
        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Developmental Milestones</h3>              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/milestones/new?childId=${child._id}`)}
              >
                <Plus size={16} className="mr-2" /> New Milestone
              </Button>
            </div>
            
            {milestones.length > 0 ? (
              <div className="space-y-6">
                {/* Group milestones by domain */}
                {['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other'].map(domain => {
                  const domainMilestones = milestones.filter(m => m.domain === domain)
                  if (domainMilestones.length === 0) return null
                  
                  return (
                    <div key={domain}>
                      <h4 className="text-md font-medium mb-3">{domain} Development</h4>
                      <div className="space-y-4">
                        {domainMilestones.map(milestone => (                          <div 
                            key={milestone._id}
                            className={`border-l-4 ${
                              milestone.isAchieved 
                              ? 'border-green-400 dark:border-green-600'
                              : 'border-amber-400 dark:border-amber-600'
                            } pl-4 py-2`}
                          >
                            <div className="flex justify-between">
                              <h5 className="font-medium">
                                <button 
                                  onClick={() => router.push(`/milestones/${milestone._id}/edit`)}
                                  className="hover:underline text-left"
                                >
                                  {milestone.title}
                                </button>
                              </h5>
                              <span className={`px-2 py-1 rounded text-xs ${
                                milestone.isAchieved
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                                : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100'
                              }`}>
                                {milestone.isAchieved ? 'Achieved' : 'In Progress'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Expected around {milestone.ageInMonths} months
                            </p>
                            {milestone.description && (
                              <p className="mt-2">{milestone.description}</p>
                            )}
                            {milestone.isAchieved && milestone.achievedDate && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Achieved on: {formatDate(milestone.achievedDate)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No milestones recorded yet.</p>                <Button 
                  variant="outline"
                  onClick={() => router.push(`/milestones/new?childId=${child._id}`)}
                  className="mt-2"
                >
                  <Plus size={16} className="mr-2" />
                  Add First Milestone
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Visit History</h3>
              {(user?.role === 'admin' || user?.role === 'parent') && (
                <Link href={`/visits/new?childId=${child._id}`}>
                  <Button variant="outline" size="sm">
                    <Calendar size={16} className="mr-2" /> Schedule Visit
                  </Button>
                </Link>
              )}
            </div>
            
            {visits.length > 0 ? (
              <div className="space-y-4">
                {visits.map(visit => (
                  <Link 
                    href={`/visits/${visit._id}`}
                    key={visit._id}
                    className="block bg-gray-50 dark:bg-gray-900 p-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-150"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">
                          Visit on {formatDate(visit.visitDate)}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Duration: {visit.duration} minutes • Location: {visit.location}
                        </p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                    
                    {visit.notes && (
                      <p className="mt-2 text-sm line-clamp-2">{visit.notes}</p>
                    )}
                    
                    {visit.milestonesAssessed && visit.milestonesAssessed.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {visit.milestonesAssessed.length} milestone{visit.milestonesAssessed.length !== 1 ? 's' : ''} assessed
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>No visits recorded yet.</p>
                {(user?.role === 'admin' || user?.role === 'parent') && (
                  <Button 
                    variant="outline"
                    onClick={() => {}}
                    className="mt-2"
                  >
                    <Calendar size={16} className="mr-2" />
                    Schedule First Visit
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
