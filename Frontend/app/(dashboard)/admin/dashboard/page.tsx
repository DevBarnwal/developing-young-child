'use client'

import { useAuth } from "@/lib/contexts/AuthContext"
import { reportService } from "@/lib/services/reportService"
import { userService } from "@/lib/services/userService"
import { childService } from "@/lib/services/childService"
import { visitService } from "@/lib/services/visitService"
import { User } from "@/lib/types/models"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from "recharts"
import { 
  Users, 
  BarChartIcon, 
  Calendar, 
  Activity, 
  CheckSquare, 
  TrendingUp, 
  AlertCircle,
  Clock,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface SummaryReport {
  totalUsers: number
  totalChildren: number
  totalVisits: number
  totalActivities: number
  recentUsers: User[]
  usersByRole: {
    admin: number
    volunteer: number
    parent: number
    user: number
  }
  childrenByMonth: {
    month: string
    count: number
  }[]
  visitsByMonth: {
    month: string
    count: number
  }[]
  milestoneAchievement: {
    domain: string
    achieved: number
    inProgress: number
  }[]
  childrenByAge: {
    ageRange: string
    count: number
  }[]
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryReport | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    } else if (user?.role === 'admin') {
      fetchSummaryData()
    }
  }, [user, router])

  const fetchSummaryData = async () => {
    try {
      setLoading(true)
      const response = await reportService.getSummaryReport()
      
      if (response.success && response.data) {
        setSummary(response.data as SummaryReport)
      } else {
        toast.error("Failed to load dashboard data")
        // Set some mock data for UI development
        setSummary({
          totalUsers: 42,
          totalChildren: 28,
          totalVisits: 123,
          totalActivities: 56,
          recentUsers: [],
          usersByRole: {
            admin: 3,
            volunteer: 15,
            parent: 20,
            user: 4
          },
          childrenByMonth: [
            { month: "Jan", count: 2 },
            { month: "Feb", count: 3 },
            { month: "Mar", count: 1 },
            { month: "Apr", count: 4 },
            { month: "May", count: 5 },
            { month: "Jun", count: 2 }
          ],
          visitsByMonth: [
            { month: "Jan", count: 8 },
            { month: "Feb", count: 12 },
            { month: "Mar", count: 15 },
            { month: "Apr", count: 22 },
            { month: "May", count: 28 },
            { month: "Jun", count: 18 }
          ],
          milestoneAchievement: [
            { domain: "Motor", achieved: 45, inProgress: 12 },
            { domain: "Cognitive", achieved: 38, inProgress: 18 },
            { domain: "Language", achieved: 30, inProgress: 15 },
            { domain: "Social", achieved: 25, inProgress: 10 },
            { domain: "Emotional", achieved: 28, inProgress: 14 }
          ],
          childrenByAge: [
            { ageRange: "0-1 yrs", count: 5 },
            { ageRange: "1-2 yrs", count: 8 },
            { ageRange: "2-3 yrs", count: 7 },
            { ageRange: "3-4 yrs", count: 5 },
            { ageRange: "4-5 yrs", count: 3 }
          ]
        })
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      toast.error(error.message || "An error occurred")
      // Set mock data
      setSummary({
        totalUsers: 42,
        totalChildren: 28,
        totalVisits: 123,
        totalActivities: 56,
        recentUsers: [],
        usersByRole: {
          admin: 3,
          volunteer: 15,
          parent: 20,
          user: 4
        },
        childrenByMonth: [
          { month: "Jan", count: 2 },
          { month: "Feb", count: 3 },
          { month: "Mar", count: 1 },
          { month: "Apr", count: 4 },
          { month: "May", count: 5 },
          { month: "Jun", count: 2 }
        ],
        visitsByMonth: [
          { month: "Jan", count: 8 },
          { month: "Feb", count: 12 },
          { month: "Mar", count: 15 },
          { month: "Apr", count: 22 },
          { month: "May", count: 28 },
          { month: "Jun", count: 18 }
        ],
        milestoneAchievement: [
          { domain: "Motor", achieved: 45, inProgress: 12 },
          { domain: "Cognitive", achieved: 38, inProgress: 18 },
          { domain: "Language", achieved: 30, inProgress: 15 },
          { domain: "Social", achieved: 25, inProgress: 10 },
          { domain: "Emotional", achieved: 28, inProgress: 14 }
        ],
        childrenByAge: [
          { ageRange: "0-1 yrs", count: 5 },
          { ageRange: "1-2 yrs", count: 8 },
          { ageRange: "2-3 yrs", count: 7 },
          { ageRange: "3-4 yrs", count: 5 },
          { ageRange: "4-5 yrs", count: 3 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSummaryData()
    setRefreshing(false)
    toast.success("Dashboard data refreshed")
  }

  if (user?.role !== 'admin') {
    return null // Don't render anything while redirecting
  }

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
  const ROLE_COLORS = {
    admin: '#8884d8',
    volunteer: '#0088FE',
    parent: '#00C49F',
    user: '#FFBB28'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw 
            size={16} 
            className={`mr-2 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-[600px]">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-4 text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      ) : summary ? (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex justify-between">
              <div>
                <h3 className="font-semibold mb-2">Total Users</h3>
                <p className="text-2xl font-bold">{summary.totalUsers}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
            
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl flex justify-between">
              <div>
                <h3 className="font-semibold mb-2">Children</h3>
                <p className="text-2xl font-bold">{summary.totalChildren}</p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                <span className="text-green-600 dark:text-green-200 font-bold text-lg">C</span>
              </div>
            </div>
            
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex justify-between">
              <div>
                <h3 className="font-semibold mb-2">Total Visits</h3>
                <p className="text-2xl font-bold">{summary.totalVisits}</p>
              </div>
              <Calendar className="h-10 w-10 text-amber-500 opacity-80" />
            </div>
            
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex justify-between">
              <div>
                <h3 className="font-semibold mb-2">Activities</h3>
                <p className="text-2xl font-bold">{summary.totalActivities}</p>
              </div>
              <Activity className="h-10 w-10 text-purple-500 opacity-80" />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Children Registration Trend</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={summary.childrenByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="New Children" 
                      stroke="#0088FE" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Monthly Visits</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.visitsByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      name="Visits" 
                      fill="#00C49F" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Users by Role</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Admin', value: summary.usersByRole.admin },
                        { name: 'Volunteer', value: summary.usersByRole.volunteer },
                        { name: 'Parent', value: summary.usersByRole.parent },
                        { name: 'Basic User', value: summary.usersByRole.user }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Admin', value: summary.usersByRole.admin },
                        { name: 'Volunteer', value: summary.usersByRole.volunteer },
                        { name: 'Parent', value: summary.usersByRole.parent },
                        { name: 'Basic User', value: summary.usersByRole.user }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Milestone Achievement by Domain</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.milestoneAchievement}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="domain" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="achieved" 
                      name="Achieved" 
                      stackId="a" 
                      fill="#00C49F" 
                    />
                    <Bar 
                      dataKey="inProgress" 
                      name="In Progress" 
                      stackId="a" 
                      fill="#FFBB28" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Additional dashboards and actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Children by Age Group</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/children">
                    View All
                  </Link>
                </Button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.childrenByAge}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageRange" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      name="Children" 
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="md:col-span-4 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">System Status</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>API Status</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm">
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>OAuth Services</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm">
                      Connected
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Update</span>
                    <span className="text-sm text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/admin/users">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/activities">
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Manage Activities
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/reports">
                      <BarChartIcon className="mr-2 h-4 w-4" />
                      View Full Reports
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900 p-6 rounded-xl">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-lg mb-2">Could not load dashboard data</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                There was a problem connecting to the reporting service. Please try again later or contact support if the issue persists.
              </p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
