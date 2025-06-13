'use client'

import { useAuth } from "@/lib/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, Users, Home, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export function DashboardNav() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  return (
    <nav className="h-screen w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">NGO Platform</h2>
          <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">Role: {user?.role}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Menu</h3>
          {user?.role === 'admin' ? (
            <>
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Users size={16} />
                Manage Users
              </Link>
              <Link href="/admin/activities" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Settings size={16} />
                Activities
              </Link>
              <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Settings size={16} />
                Reports
              </Link>
            </>
          ) : user?.role === 'volunteer' ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Home size={16} />
                Dashboard
              </Link>
              <Link href="/children" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Users size={16} />
                Children
              </Link>
              <Link href="/visits" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Settings size={16} />
                Visit Records
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <User size={16} />
                Profile
              </Link>
            </>
          ) : user?.role === 'parent' ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Home size={16} />
                Dashboard
              </Link>
              <Link href="/children" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Users size={16} />
                My Children
              </Link>
              <Link href="/activities" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Settings size={16} />
                Activities
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <User size={16} />
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Home size={16} />
                Home
              </Link>
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <User size={16} />
                Profile
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 w-56">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </nav>
  )
}
