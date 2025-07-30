"use client"

import { Profile } from "@/components/profile" 
import { useAuth } from "@/context/AuthContext"
import { useDocumentViewer } from "@/context/DocumentViewerContext"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkSession } = useAuth()
  const { setSelectedDocument } = useDocumentViewer()

  // Handle profile updates
  const handleUpdateProfile = async (updatedData: any) => {
    if (!user?.id) return
    
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      })

      const result = await res.json()

      if (res.ok) {
        toast.success('Profile updated successfully!')
        // Re-fetch user data to update the UI
        await checkSession()
        return true // Signal success to close modal
      } else {
        toast.error(result.error || 'Failed to update profile.')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An unexpected error occurred.')
    }
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
    <AuthenticatedLayout currentPage="profile">
      <Profile 
        user={user} 
        onViewDocument={setSelectedDocument} 
        onUpdateProfile={handleUpdateProfile} 
        isOwnProfile={true} 
      />
    </AuthenticatedLayout>
  )
}
