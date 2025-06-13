'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { userService } from '@/lib/services/userService'
import { User } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { MoreHorizontal, Edit, Trash, UserCheck, UserX } from 'lucide-react'

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>('all')

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [selectedRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAllUsers(selectedRole !== 'all' ? selectedRole : undefined)
      
      if (response.success) {
        setUsers(response.data || [])
      } else {
        toast.error('Failed to load users')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'parent' | 'volunteer') => {
    try {
      const response = await userService.updateUserRole(userId, newRole)
      
      if (response.success) {
        toast.success(`User role updated to ${newRole}`)
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => u._id === userId ? { ...u, role: newRole } : u)
        )
      } else {
        toast.error(response.message || 'Failed to update role')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await userService.deleteUser(userId)
      
      if (response.success) {
        toast.success('User deleted successfully')
        // Update local state
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId))
      } else {
        toast.error(response.message || 'Failed to delete user')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        
        <div className="flex space-x-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 bg-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="parent">Parents</option>
            <option value="volunteer">Volunteers</option>
            <option value="admin">Admins</option>
          </select>
          
          <Button onClick={fetchUsers} size="sm">
            Refresh
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.isEmailVerified ? (
                        <UserCheck size={18} className="text-green-500" />
                      ) : (
                        <UserX size={18} className="text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1">
                      <div className="flex space-x-1">
                        <div className="relative group">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          
                          <div className="absolute right-0 z-10 invisible group-hover:visible bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden py-1 w-40 border border-gray-200 dark:border-gray-700">
                            <button 
                              className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => handleRoleChange(user._id || user.id!, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              <UserCheck size={16} className="mr-2" /> Make Admin
                            </button>
                            <button 
                              className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => handleRoleChange(user._id || user.id!, 'parent')}
                              disabled={user.role === 'parent'}
                            >
                              <UserCheck size={16} className="mr-2" /> Make Parent
                            </button>
                            <button 
                              className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => handleRoleChange(user._id || user.id!, 'volunteer')}
                              disabled={user.role === 'volunteer'}
                            >
                              <UserCheck size={16} className="mr-2" /> Make Volunteer
                            </button>
                            <button 
                              className="flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => handleRoleChange(user._id || user.id!, 'user')}
                              disabled={user.role === 'user'}
                            >
                              <UserCheck size={16} className="mr-2" /> Make User
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button 
                              className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => handleDeleteUser(user._id || user.id!)}
                            >
                              <Trash size={16} className="mr-2" /> Delete User
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
