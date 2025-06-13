'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { activityService } from '@/lib/services/activityService'
import { Activity } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2,
  Check,
  X
} from 'lucide-react'

export default function AdminActivitiesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  
  // Filter states
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>('')
  
  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/activities')
      toast.error("You don't have permission to access this page")
    }
  }, [user, router])

  // Load activities on component mount
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchActivities()
    }
  }, [user])
  
  const fetchActivities = async () => {
    try {
      setLoading(true)
      
      // Build filters object
      const filters: any = {}
      if (selectedDomain) filters.domain = selectedDomain
      
      const response = await activityService.getActivities(filters)
      
      if (response.success) {
        // For admin, get all activities including unapproved ones
        setActivities(response.data || [])
      } else {
        toast.error('Failed to load activities')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const toggleApproval = async (activity: Activity) => {
    try {
      const updatedActivity = { 
        ...activity, 
        isApproved: !activity.isApproved 
      }
      
      const response = await activityService.updateActivity(activity._id, updatedActivity)
      
      if (response.success) {
        toast.success(`Activity ${activity.isApproved ? 'unapproved' : 'approved'} successfully`)
        
        // Update local state
        setActivities(prev => 
          prev.map(a => a._id === activity._id ? { ...a, isApproved: !a.isApproved } : a)
        )
      } else {
        toast.error('Failed to update activity')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    }
  }
  
  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id)
      return
    }
    
    try {
      setDeletingId(id)
      
      // Soft delete by setting isDeleted to true
      const response = await activityService.updateActivity(id, { isDeleted: true })
      
      if (response.success) {
        toast.success('Activity deleted successfully')
        
        // Update local state
        setActivities(prev => prev.filter(activity => activity._id !== id))
      } else {
        toast.error('Failed to delete activity')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }
  
  const applyFilters = () => {
    fetchActivities()
    setShowFilters(false)
  }
  
  const resetFilters = () => {
    setSelectedDomain('')
    setSelectedApprovalStatus('')
    setTimeout(() => fetchActivities(), 0)
  }
  
  // Filter activities based on search term and approval status
  const filteredActivities = activities.filter(activity => {
    // Match search term
    const matchesSearch = searchTerm === '' || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Match approval status
    const matchesApproval = selectedApprovalStatus === '' || 
      (selectedApprovalStatus === 'approved' && activity.isApproved) ||
      (selectedApprovalStatus === 'pending' && !activity.isApproved)
    
    return matchesSearch && matchesApproval && !activity.isDeleted
  })
  
  const domains = ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other']
  
  if (user?.role !== 'admin') {
    return null // Don't render anything while redirecting
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Activities</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create, edit, and manage developmental activities
          </p>
        </div>
        
        <Link href="/activities/new">
          <Button>
            <Plus size={16} className="mr-2" />
            Create Activity
          </Button>
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex-1 min-w-[200px] max-w-lg">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" />
            Filter
            {(selectedDomain || selectedApprovalStatus) && (
              <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Domain
                </label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                >
                  <option value="">All Domains</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  value={selectedApprovalStatus}
                  onChange={(e) => setSelectedApprovalStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                >
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {filteredActivities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Age Range
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredActivities.map((activity) => (
                    <tr 
                      key={activity._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {activity.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                          activity.domain === 'Motor' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          activity.domain === 'Cognitive' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          activity.domain === 'Language' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          activity.domain === 'Social' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          activity.domain === 'Emotional' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {activity.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {activity.ageRange.min}-{activity.ageRange.max} months
                          <br />
                          <span className="text-gray-500 dark:text-gray-400">
                            ({Math.floor(activity.ageRange.min / 12)}-{Math.floor(activity.ageRange.max / 12)} years)
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.isApproved
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        }`}>
                          {activity.isApproved 
                            ? <CheckCircle className="w-3 h-3 mr-1" />
                            : <XCircle className="w-3 h-3 mr-1" />
                          }
                          {activity.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        {/* Toggle Approval */}
                        <Button
                          size="sm"
                          variant={activity.isApproved ? "outline" : "default"}
                          onClick={() => toggleApproval(activity)}
                          className={activity.isApproved ? "border-green-500 text-green-500 hover:text-green-600 hover:bg-green-50" : ""}
                        >
                          {activity.isApproved 
                            ? <XCircle className="w-4 h-4 mr-1" />
                            : <CheckCircle className="w-4 h-4 mr-1" />
                          }
                          {activity.isApproved ? 'Unapprove' : 'Approve'}
                        </Button>
                        
                        {/* Edit */}
                        <Button
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/activities/${activity._id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        
                        {/* Delete */}
                        {confirmDelete === activity._id ? (
                          <span className="inline-flex rounded-md shadow-sm">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(activity._id)}
                              disabled={!!deletingId}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmDelete(null)}
                              className="ml-1"
                              disabled={!!deletingId}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </span>
                        ) : (
                          <Button
                            size="sm" 
                            variant="outline"
                            onClick={() => setConfirmDelete(activity._id)}
                            className="border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-2">No activities found</p>
              <p className="text-sm max-w-md mx-auto">
                {searchTerm || selectedDomain || selectedApprovalStatus ? 
                  'Try adjusting your filters to find what you\'re looking for.' :
                  'Create new activities for children\'s development.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
