"use client"

import { useState } from "react"
import useSWR from "swr"
import { Home, Compass, Upload, User, Heart, Bookmark, Users, Settings, LogOut, Activity, Menu, X } from "lucide-react"
import { UserAvatar } from "@/components/ui/user-avatar"

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  user: any
  onLogout?: () => void
}

export function Sidebar({ currentPage, onPageChange, user, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: countsData = {} } = useSWR('/api/user-counts', fetcher)
  const menuItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "feed", label: "Feed", icon: Activity },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "profile", label: "Profile", icon: User },
  ]

  const secondaryItems = [
    { id: "favorites", label: "Favorites", icon: Heart, count: countsData.favorites || 0 },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark, count: countsData.bookmarks || 0 },
    { id: "following", label: "Following", icon: Users, count: countsData.following || 0 },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 z-40 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold text-gray-900">FileHub</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === item.id ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={19} />
                <span className="text-sm">{item.label}</span>
                {item.count !== undefined && (
                  <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    currentPage === item.id ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={19} />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <UserAvatar user={user} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              @{user?.email?.split('@')[0] || 'user'}
            </p>
          </div>
        </div>
        
        {/* Settings and Logout */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onPageChange('settings')}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 text-gray-900 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold border border-gray-300 shadow-sm"
          >
            <Settings size={15} />
            <span className="text-xs">Settings</span>
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center p-2.5 text-red-600 bg-white hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-300 shadow-sm"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
