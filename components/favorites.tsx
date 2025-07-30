"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Heart, Bookmark, Users, Search, Eye, Download, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// SWR fetcher function
const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json())

interface FavoritesProps {
  user: any
  type: "favorites" | "bookmarks" | "following"
  onViewDocument: (doc: any) => void
}

export function Favorites({ user, type, onViewDocument }: FavoritesProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  // Fetch bookmarks or liked documents based on type
  const { data: bookmarksData, error: bookmarksError } = useSWR(
    type === "bookmarks" ? '/api/interactions/bookmarks' : null,
    fetcher
  )
  
  const { data: likesData = [] } = useSWR(
    type === "favorites" ? '/api/interactions/likes' : null,
    fetcher
  )
  
  // Fetch following users
  const { data: connectionsData } = useSWR(
    type === "following" ? '/api/interactions/connections' : null,
    fetcher
  )
  
  const favoriteDocuments = type === "favorites" ? (Array.isArray(likesData) ? likesData : []) : []
  const bookmarkedDocuments = type === "bookmarks" ? (Array.isArray(bookmarksData) ? bookmarksData : []) : []
  const followingUsers = connectionsData?.following || []

  const getPageConfig = () => {
    switch (type) {
      case "favorites":
        return {
          title: "Favorites",
          subtitle: "Documents you've liked",
          icon: Heart,
          emptyMessage: "No favorite documents yet",
          emptySubtext: "Documents you like will appear here",
        }
      case "bookmarks":
        return {
          title: "Bookmarks",
          subtitle: "Documents you've saved for later",
          icon: Bookmark,
          emptyMessage: "No bookmarked documents yet",
          emptySubtext: "Documents you bookmark will appear here",
        }
      case "following":
        return {
          title: "Following",
          subtitle: "People you follow",
          icon: Users,
          emptyMessage: "Not following anyone yet",
          emptySubtext: "People you follow will appear here",
        }
      default:
        return {
          title: "Favorites",
          subtitle: "Documents you've liked",
          icon: Heart,
          emptyMessage: "No favorite documents yet",
          emptySubtext: "Documents you like will appear here",
        }
    }
  }

  const config = getPageConfig()
  const Icon = config.icon

  // Use the appropriate document array based on type
  const documentsToFilter = type === "bookmarks" ? bookmarkedDocuments : favoriteDocuments
  
  const filteredDocuments = documentsToFilter.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredUsers = followingUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Icon size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-gray-600">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-2xl"
            />
          </div>
          {type !== "following" && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-2xl px-4 py-3 bg-white text-sm"
            >
              <option value="recent">Recently Saved</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="author">By Author</option>
              <option value="category">By Category</option>
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {type === "following" ? (
        /* Following Users */
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((followedUser) => (
              <div
                key={followedUser.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => router.push(`/profile/${followedUser.id}`)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={followedUser.avatar || "/placeholder.svg"}
                    alt={followedUser.name}
                    className="w-16 h-16 rounded-2xl"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{followedUser.name}</h3>
                        {followedUser.verified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl">
                          Following
                        </Button>
                        <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl">
                          Message
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">@{followedUser.username}</p>
                    <p className="text-gray-700 mt-2 mb-3">{followedUser.bio}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{(followedUser.followers || 0).toLocaleString()} followers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart size={16} />
                        <span>{followedUser.documents || 0} documents</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>Followed {followedUser.followedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{config.emptyMessage}</h3>
              <p className="text-gray-500">{config.emptySubtext}</p>
            </div>
          )}
        </div>
      ) : (
        /* Documents Grid */
        <div>
          {filteredDocuments.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  {filteredDocuments.length} {type === "favorites" ? "liked" : "bookmarked"} document
                  {filteredDocuments.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => onViewDocument(doc)}
                  >
                    <div className="relative">
                      <img
                        src={doc.thumbnail || "/placeholder.svg"}
                        alt={doc.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-lg">
                          {doc.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-lg">
                          {doc.type}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                            <Eye size={20} className="text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{doc.title}</h3>

                      <div className="flex items-center space-x-2 mb-3">
                        <img
                          src={doc.authorAvatar || "/placeholder.svg"}
                          alt={doc.author}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-xs text-gray-600">{doc.author}</span>
                        {doc.verified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{doc.pages} pages</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart size={12} />
                            <span>{doc.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download size={12} />
                            <span>{doc.downloads}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Saved {doc.savedAt}</span>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Icon size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{config.emptyMessage}</h3>
              <p className="text-gray-500 mb-6">{config.emptySubtext}</p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
                Explore Documents
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
