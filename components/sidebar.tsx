"use client"

import { Home, Compass, Upload, User, Heart, Bookmark, Users, Settings, LogOut, Activity } from "lucide-react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  user: any
}

export function Sidebar({ currentPage, onPageChange, user }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "feed", label: "Feed", icon: Activity },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "profile", label: "Profile", icon: User },
  ]

  const secondaryItems = [
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "following", label: "Following", icon: Users },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
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

      {/* Settings and Logout */}
      <div className="p-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
        <div className="flex items-center space-x-2 mt-2 mb-2">
          <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 text-gray-900 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold border-2 border-gray-300 shadow-md">
            <Settings size={15} />
            <span className="text-xs">Settings</span>
          </button>
          <button className="flex items-center justify-center p-2.5 text-gray-900 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border-2 border-gray-300 shadow-md">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
