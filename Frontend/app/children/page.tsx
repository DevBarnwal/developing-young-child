'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { childService } from '@/lib/services/childService'
import { Child } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { Plus, Eye, Edit } from 'lucide-react'

export default function ChildrenPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    specialNeeds: '',
    developmentalNotes: ''
  })

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
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await childService.createChild(formData)
      
      if (response.success) {
        toast.success('Child added successfully')
        setShowAddModal(false)
        setFormData({
          name: '',
          dob: '',
          gender: 'Male',
          specialNeeds: '',
          developmentalNotes: ''
        })
        // Refresh the list
        fetchChildren()
      } else {
        toast.error(response.message || 'Failed to add child')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
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
    
    return years > 0 ? `${years} years${months > 0 ? `, ${months} months` : ''}` : `${months} months`
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user?.role === 'parent' ? 'My Children' : 'Children'}
        </h1>
        
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} className="mr-2" />
          Add Child
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.length > 0 ? (
            children.map(child => (
              <div 
                key={child._id} 
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-medium mb-2">{child.name}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Age: {calculateAge(child.dob)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gender: {child.gender}
                  </p>
                  {child.specialNeeds && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Special Needs: {child.specialNeeds}
                    </p>
                  )}
                  {child.lastVisitDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Visit: {new Date(child.lastVisitDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Link href={`/children/${child._id}`}>
                    <Button variant="outline" size="sm">
                      <Eye size={14} className="mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/children/${child._id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-10 text-center text-gray-500 dark:text-gray-400">
              No children found. Click "Add Child" to get started.
            </div>
          )}
        </div>
      )}

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Child</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Child's Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dob" className="block text-sm font-medium mb-1">
                  Date of Birth
                </label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="specialNeeds" className="block text-sm font-medium mb-1">
                  Special Needs (if any)
                </label>
                <textarea
                  id="specialNeeds"
                  name="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="developmentalNotes" className="block text-sm font-medium mb-1">
                  Developmental Notes
                </label>
                <textarea
                  id="developmentalNotes"
                  name="developmentalNotes"
                  value={formData.developmentalNotes}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 bg-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Child</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
