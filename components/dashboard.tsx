"use client"

import useSWR from "swr"
import { TrendingUp, Users, FileText, Heart, Upload, Eye, Download, ArrowUpRight, Clock, Activity, Bookmark, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface DashboardProps {
  user: any
  onViewDocument: (doc: any) => void
  onPageChange: (page: string) => void
}

export function Dashboard({ user, onViewDocument, onPageChange }: DashboardProps) {
const { data: recentActivity = [], error: activityError } = useSWR("/api/recent-activity", fetcher)
const { data: trendingDocuments = [], error: trendingError } = useSWR("/api/trending-documents", fetcher)

  const quickActions = [
    {
      title: "Upload Document",
      description: "Share your knowledge",
      icon: Upload,
      color: "blue",
      action: () => onPageChange("upload"),
    },
    {
      title: "Explore Trending",
      description: "Discover popular content",
      icon: TrendingUp,
      color: "green",
      action: () => onPageChange("explore"),
    },
    {
      title: "View Feed",
      description: "See latest updates",
      icon: Activity,
      color: "purple",
      action: () => onPageChange("feed"),
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={16} className="text-red-500" />
      case "follow":
        return <Users size={16} className="text-blue-500" />
      case "bookmark":
        return <Bookmark size={16} className="text-yellow-500" />
      case "upload":
        return <Upload size={16} className="text-green-500" />
      case "profile":
        return <User size={16} className="text-purple-500" />
      case "download":
        return <Download size={16} className="text-purple-500" />
      default:
        return <Activity size={16} className="text-gray-500" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Good morning, {user.name.split(" ")[0]}! 👋</h1>
            <p className="text-gray-600">Here's what's happening with your documents today.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

        {/* Quick Actions */}
        <div className="col-span-1 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 bg-${action.color}-100 rounded-xl flex items-center justify-center`}>
                      <Icon size={20} className={`text-${action.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Trending Documents */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Trending Today</h2>
              <Button
                onClick={() => onPageChange("explore")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-transparent hover:bg-blue-50 px-3 py-1 rounded-lg"
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {trendingDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onViewDocument(doc)}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <img
                    src={doc.thumbnail || "/placeholder.svg"}
                    alt={doc.title}
                    className="w-12 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-gray-500 mb-1">by {doc.author}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye size={12} />
                        <span>{doc.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart size={12} />
                        <span>{doc.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-1 lg:col-span-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Button
                onClick={() => onPageChange("feed")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-transparent hover:bg-blue-50 px-3 py-1 rounded-lg"
              >
                View Feed
              </Button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <UserAvatar 
                    user={{ name: activity.user || 'Unknown User', avatarUrl: activity.avatar }}
                    size="small"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <p className="text-sm text-gray-900">{activity.message}</p>
                    </div>
                    {activity.document && (
                      <p className="text-sm text-blue-600 font-medium mb-1">"{activity.document}"</p>
                    )}
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
