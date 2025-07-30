"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useDocumentViewer } from "@/context/DocumentViewerContext"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Feed } from "@/components/feed"

export default function FeedPage() {
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
    <AuthenticatedLayout currentPage="feed">
      <Feed user={user} onViewDocument={setSelectedDocument} />
    </AuthenticatedLayout>
  )
}
