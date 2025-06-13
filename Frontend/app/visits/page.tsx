'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { visitService } from '@/lib/services/visitService'
import { Visit } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { Plus, Calendar, Search, ChevronDown } from 'lucide-react'

export default function VisitsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Load visits on component mount
  useEffect(() => {
    if (user?.id) {
      fetchVisits()
    }
  }, [user])

  const fetchVisits = async () => {
    try {
      setLoading(true)
      const response = await visitService.getVisitsByVolunteer(
        user!.id,
        startDate || undefined,
        endDate || undefined
      )
      
      if (response.success) {
        setVisits(response.data || [])
      } else {
        toast.error('Failed to load visits')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVisits()
  }

  const handleClearFilters = () => {
    setStartDate('')
    setEndDate('')
    setSearchTerm('')
    fetchVisits()
  }

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Filter and sort visits
  const filteredVisits = visits
    .filter(visit => {
      if (!searchTerm) return true
      
      // Search in child name if available
      const childName = typeof visit.childId === 'object' ? visit.childId.name : ''
      
      return childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.location.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      const dateA = new Date(a.visitDate).getTime()
      const dateB = new Date(b.visitDate).getTime()
      
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Visit Records</h1>
        
        <Link href="/visits/new">
          <Button>
            <Plus size={16} className="mr-2" />
            New Visit
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="block text-sm font-medium mb-1">
              Search
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                id="search"
                type="text"
                placeholder="Search visits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <Input 
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="flex-1 min-w-[180px]">
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              End Date
            </label>
            <Input 
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <Button type="submit">Filter</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {filteredVisits.length > 0 ? (
            <div>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredVisits.length} visit{filteredVisits.length !== 1 && 's'}
                </div>
                
                <button
                  onClick={toggleSortDirection}
                  className="flex items-center text-sm font-medium"
                >
                  Date {sortDirection === 'asc' ? 'Oldest first' : 'Newest first'}
                  <ChevronDown size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVisits.map(visit => (
                  <Link
                    href={`/visits/${visit._id}`}
                    key={visit._id}
                    className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          Visit on {formatDate(visit.visitDate)}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {typeof visit.childId === 'object' 
                            ? visit.childId.name 
                            : 'Child ID: ' + visit.childId}
                        </div>
                        <div className="mb-2">
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs">
                            {visit.location}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            Duration: {visit.duration} minutes
                          </span>
                        </div>
                      </div>                      <Button 
                        variant="ghost" 
                        className="hidden md:block"
                      >
                        View Details
                      </Button>
                    </div>
                    
                    {visit.notes && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {visit.notes}
                      </p>
                    )}
                    
                    {visit.recommendations && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Recommendations:</span>
                        <span className="text-gray-700 dark:text-gray-300 line-clamp-1 ml-1">
                          {visit.recommendations}
                        </span>
                      </div>
                    )}                    <Button 
                      variant="ghost" 
                      className="mt-2 md:hidden"
                    >
                      View Details
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p className="mb-2">No visits found</p>
              {!startDate && !endDate && !searchTerm ? (
                <p className="text-sm max-w-md mx-auto">
                  You haven't recorded any visits yet. Click "New Visit" to create your first visit record.
                </p>
              ) : (
                <p className="text-sm max-w-md mx-auto">
                  Try adjusting your filters or search term to find what you're looking for.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
