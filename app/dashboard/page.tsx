"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useDocumentViewer } from "@/context/DocumentViewerContext"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Dashboard } from "@/components/dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { setSelectedDocument } = useDocumentViewer()

  // Handle page changes from dashboard component
  const handlePageChange = (page: string) => {
    router.push(`/${page}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/')
    return null
  }

  return (
    <AuthenticatedLayout currentPage="dashboard">
      <Dashboard 
        user={user} 
        onViewDocument={setSelectedDocument} 
        onPageChange={handlePageChange} 
      />
    </AuthenticatedLayout>
  )
}
