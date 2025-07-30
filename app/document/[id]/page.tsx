"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { DocumentPreview } from "@/components/document-preview"

export default function DocumentPreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

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
    <AuthenticatedLayout currentPage="document">
      <DocumentPreview documentId={params.id} />
    </AuthenticatedLayout>
  )
}
