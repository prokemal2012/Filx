"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Landing } from "@/components/landing"
import { AuthForm } from "@/components/auth-form"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState("landing")
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])
  
  // Handle successful login
  const handleLogin = () => {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect to dashboard
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

  return <Landing onGetStarted={() => setCurrentPage("auth")} />
}
