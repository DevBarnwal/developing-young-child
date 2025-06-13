'use client'

import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    // If token is present in URL, store it
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      // Remove token from URL without refreshing
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [token])

  useEffect(() => {
    if (!loading) {
      // Redirect to login if not authenticated
      if (!user) {
        router.push('/login')
      }      // Ensure correct dashboard access
      else {
        const pathname = window.location.pathname
        if (pathname.startsWith('/admin/dashboard') && user.role !== 'admin') {
          router.push('/dashboard')
        }
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8 bg-white px-4 dark:bg-black">
        {children}
      </main>
    </div>
  )
}
