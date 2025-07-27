"use client"

import { useState } from "react"
import { TrendingUp, Users, FileText, Heart, Upload, Eye, Download, ArrowUpRight, Clock, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardProps {
  user: any
  onViewDocument: (doc: any) => void
  onPageChange: (page: string) => void
}

export function Dashboard({ user, onViewDocument, onPageChange }: DashboardProps) {
  const [timeRange, setTimeRange] = useState("week")

  // *TODO: DATA* - Replace with data fetched from the server
  const stats = []

  // *TODO: DATA* - Replace with real recent activity data
  const recentActivity = []

  // *TODO: DATA* - Replace with real trending documents data
  const trendingDocuments = []

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
      case "comment":
        return <Activity size={16} className="text-green-500" />
      case "download":
        return <Download size={16} className="text-purple-500" />
      default:
        return <Activity size={16} className="text-gray-500" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Good morning, {user.name.split(" ")[0]}! 👋</h1>
            <p className="text-gray-600">Here's what's happening with your documents today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 bg-white text-sm"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Stats Cards */}
        <div className="col-span-12 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-2xl flex items-center justify-center`}>
                      <Icon size={24} className={`text-${stat.color}-600`} />
                    </div>
                    <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                      <ArrowUpRight size={16} />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-4">
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
        <div className="col-span-12 lg:col-span-8">
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
                  <img
                    src={activity.avatar || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full flex-shrink-0"
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
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Button
                onClick={() => onPageChange("feed")}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium bg-transparent hover:bg-gray-50 px-4 py-2 rounded-lg"
              >
                View All Activity
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
