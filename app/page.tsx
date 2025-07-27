"use client"

import { useState } from "react"
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

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState("landing")
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  if (currentPage === "landing") {
    return <Landing onGetStarted={() => setCurrentPage("auth")} />
  }

  if (currentPage === "auth") {
    return (
      <AuthForm
        onLogin={(user) => {
          setCurrentUser(user)
          setCurrentPage("dashboard")
        }}
        onBack={() => setCurrentPage("landing")}
      />
    )
  }

  if (!currentUser) {
    return <AuthForm onLogin={setCurrentUser} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={currentUser} onViewDocument={setSelectedDocument} onPageChange={setCurrentPage} />
      case "feed":
        return <Feed user={currentUser} onViewDocument={setSelectedDocument} />
      case "explore":
        return <Explore onViewDocument={setSelectedDocument} />
      case "upload":
        return <Upload user={currentUser} />
      case "profile":
        return <Profile user={currentUser} onViewDocument={setSelectedDocument} />
      case "favorites":
      case "bookmarks":
        return <Favorites user={currentUser} type={currentPage} onViewDocument={setSelectedDocument} />
      case "following":
        return <Favorites user={currentUser} type="following" onViewDocument={setSelectedDocument} />
      default:
        return <Dashboard user={currentUser} onViewDocument={setSelectedDocument} onPageChange={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} user={currentUser} />
      <main className="flex-1 ml-64">{renderPage()}</main>

      {selectedDocument && <DocumentViewer document={selectedDocument} onClose={() => setSelectedDocument(null)} />}
    </div>
  )
}
