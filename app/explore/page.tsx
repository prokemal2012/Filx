"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useDocumentViewer } from "@/context/DocumentViewerContext"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Explore } from "@/components/explore"

export default function ExplorePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { setSelectedDocument } = useDocumentViewer()

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
    <AuthenticatedLayout currentPage="explore">
      <Explore onViewDocument={setSelectedDocument} />
    </AuthenticatedLayout>
  )
}
