'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { activityService } from '@/lib/services/activityService'
import { Activity } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Search, Filter, X } from 'lucide-react'

export default function ActivitiesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 60]) // 0-5 years
  
  // Load activities on component mount
  useEffect(() => {
    fetchActivities()
  }, [])
  
  const fetchActivities = async () => {
    try {
      setLoading(true)
      
      // Build filters object
      const filters: any = {}
      if (selectedDomain) filters.domain = selectedDomain
      if (selectedLanguage) filters.language = selectedLanguage
      if (selectedDifficulty) filters.difficultyLevel = selectedDifficulty
      
      const response = await activityService.getActivities(filters)
      
      if (response.success) {
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
  
  const applyFilters = () => {
    fetchActivities()
    setShowFilters(false)
  }
  
  const resetFilters = () => {
    setSelectedDomain('')
    setSelectedLanguage('')
    setSelectedDifficulty('')
    setAgeRange([0, 60])
    setTimeout(() => fetchActivities(), 0)
  }
  
  // Filter activities based on search term and age range
  const filteredActivities = activities.filter(activity => {
    // Match search term
    const matchesSearch = searchTerm === '' || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Match age range
    const matchesAge = activity.ageRange.min <= ageRange[1] && activity.ageRange.max >= ageRange[0]
    
    return matchesSearch && matchesAge
  })
  
  const domains = ['Motor', 'Cognitive', 'Language', 'Social', 'Emotional', 'Other']
  const difficultyLevels = ['Easy', 'Medium', 'Hard']
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        
        {user?.role === 'admin' && (
          <Button>Create Activity</Button>
        )}
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
            {(selectedDomain || selectedLanguage || selectedDifficulty || 
              ageRange[0] !== 0 || ageRange[1] !== 60) && (
              <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                  Age Range
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{ageRange[0]} mo</span>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={ageRange[0]}
                    onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                    className="flex-1"
                  />
                  <span className="text-sm">to</span>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={ageRange[1]}
                    onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                  <span className="text-sm">{ageRange[1]} mo</span>
                </div>
                <div className="text-xs text-center text-gray-500 mt-1">
                  {Math.floor(ageRange[0] / 12)} to {Math.floor(ageRange[1] / 12)} years
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                >
                  <option value="">All Languages</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                >
                  <option value="">Any Difficulty</option>
                  {difficultyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
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
        <div>
          {filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map(activity => (
                <div 
                  key={activity._id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className={`h-2 w-full ${
                    activity.domain === 'Motor' ? 'bg-red-500' :
                    activity.domain === 'Cognitive' ? 'bg-blue-500' :
                    activity.domain === 'Language' ? 'bg-green-500' :
                    activity.domain === 'Social' ? 'bg-purple-500' :
                    activity.domain === 'Emotional' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-medium line-clamp-1">{activity.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        activity.difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {activity.difficultyLevel || 'Medium'}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="mr-3">{activity.domain}</span>
                      <span>{activity.ageRange.min}-{activity.ageRange.max} months</span>
                    </div>
                    
                    <p className="mb-3 line-clamp-2 text-sm">{activity.description}</p>
                    
                    <div className="mb-4">
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {activity.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag} 
                              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-2 py-1 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {activity.tags.length > 3 && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs px-1">
                              +{activity.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                      <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/activities/${activity._id}`)}
                    >
                      View Activity
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-10 text-center shadow-sm">
              <X size={48} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">No Activities Found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                No activities match your current filters. Try adjusting your search or filters to find activities.
              </p>
              {(selectedDomain || selectedLanguage || selectedDifficulty || searchTerm || 
                ageRange[0] !== 0 || ageRange[1] !== 60) && (
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    resetFilters()
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
