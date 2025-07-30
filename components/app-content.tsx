"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { AuthForm } from "@/components/auth-form"
import { Landing } from "@/components/landing"
import { Dashboard } from "@/components/dashboard"
import { Feed } from "@/components/feed"
import { Explore } from "@/components/explore"
import { Upload } from "@/components/upload"
import { Profile } from "@/components/profile"
import { DocumentViewer } from "@/components/document-viewer"
import { Favorites } from "@/components/favorites"

export default function AppContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState("landing")
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  
  // Check URL for page parameter
  useEffect(() => {
    const page = searchParams.get('page')
    if (page && ['dashboard', 'feed', 'explore', 'upload', 'profile', 'favorites', 'bookmarks', 'following'].includes(page)) {
      setCurrentPage(page)
    } else if (isAuthenticated) {
      setCurrentPage('dashboard')
    }
  }, [searchParams, isAuthenticated])
  
  // Update URL when page changes
  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    if (page !== 'landing' && page !== 'auth') {
      const url = new URL(window.location.href)
      url.searchParams.set('page', page)
      window.history.pushState({}, '', url.toString())
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete('page')
      window.history.pushState({}, '', url.toString())
    }
  }
  
  // Handle successful login
  const handleLogin = () => {
    setCurrentPage("dashboard")
    const url = new URL(window.location.href)
    url.searchParams.set('page', 'dashboard')
    window.history.pushState({}, '', url.toString())
  }
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      setCurrentPage("landing")
      const url = new URL(window.location.href)
      url.searchParams.delete('page')
      window.history.pushState({}, '', url.toString())
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  // Update user profile
  const handleUpdateProfile = (updatedData: any) => {
    // This would need to be implemented in the AuthContext
    console.log('Profile update:', updatedData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (currentPage === "landing") {
    return <Landing onGetStarted={() => setCurrentPage("auth")} />
  }

  if (currentPage === "auth") {
    return (
      <AuthForm
        onLogin={handleLogin}
        onBack={() => setCurrentPage("landing")}
      />
    )
  }

  if (!isAuthenticated) {
    return <AuthForm onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={user} onViewDocument={setSelectedDocument} onPageChange={handlePageChange} />
      case "feed":
        return <Feed user={user} onViewDocument={setSelectedDocument} />
      case "explore":
        return <Explore onViewDocument={setSelectedDocument} />
      case "upload":
        return <Upload user={user} />
      case "profile":
        return <Profile user={user} onViewDocument={setSelectedDocument} onUpdateProfile={handleUpdateProfile} />
      case "favorites":
      case "bookmarks":
        return <Favorites user={user} type={currentPage} onViewDocument={setSelectedDocument} />
      case "following":
        return <Favorites user={user} type="following" onViewDocument={setSelectedDocument} />
      default:
        return <Dashboard user={user} onViewDocument={setSelectedDocument} onPageChange={handlePageChange} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} user={user} onLogout={handleLogout} />
      <main className="flex-1 ml-64">{renderPage()}</main>

      {selectedDocument && <DocumentViewer document={selectedDocument} onClose={() => setSelectedDocument(null)} />}
    </div>
  )
}
