"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useDocumentViewer } from "@/context/DocumentViewerContext"
import { Sidebar } from "@/components/sidebar"
import { DocumentViewer } from "@/components/document-viewer"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  currentPage: string
}

export function AuthenticatedLayout({ children, currentPage }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { selectedDocument, closeDocument } = useDocumentViewer()

  // Handle page navigation
  const handlePageChange = (page: string) => {
    switch (page) {
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'feed':
        router.push('/feed')
        break
      case 'explore':
        router.push('/explore')
        break
      case 'upload':
        router.push('/upload')
        break
      case 'profile':
        router.push('/profile')
        break
      case 'favorites':
        router.push('/favorites')
        break
      case 'bookmarks':
        router.push('/bookmarks')
        break
      case 'following':
        router.push('/following')
        break
      default:
        router.push('/dashboard')
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        user={user} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        {children}
      </main>
      
      {selectedDocument && (
        <DocumentViewer 
          document={selectedDocument} 
          onClose={closeDocument} 
        />
      )}
    </div>
  )
}
