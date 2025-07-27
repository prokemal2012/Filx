"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Eye } from "lucide-react"

interface FeedProps {
  user: any
  onViewDocument: (doc: any) => void
}

export function Feed({ user, onViewDocument }: FeedProps) {
  // *TODO: DATA* - Replace with real posts data fetched from server
  const [posts, setPosts] = useState([])

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    )
  }

  const handleBookmark = (postId: number) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post)))
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Feed</h1>
        <p className="text-gray-600">Discover the latest documents from people you follow</p>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
          >
            {/* Post Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.author.avatar || "/placeholder.svg"}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                      {post.author.verified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      @{post.author.username} • {post.timestamp}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-full">
                  <MoreHorizontal size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Document Preview */}
            <div className="px-6 pb-4">
              <div
                className="bg-gray-50 rounded-2xl p-6 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onViewDocument(post.document)}
              >
                <div className="flex space-x-4">
                  <img
                    src={post.document.thumbnail || "/placeholder.svg"}
                    alt={post.document.title}
                    className="w-24 h-32 object-cover rounded-xl border border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                        {post.document.category}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                        {post.document.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{post.document.title}</h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.document.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{post.document.pages} pages</span>
                      <div className="flex items-center space-x-1">
                        <Eye size={14} />
                        <span>Click to view</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Actions */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
                      post.isLiked ? "text-red-500 bg-red-50" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
                    <Share size={18} />
                    <span className="text-sm font-medium">{post.shares}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`p-2 rounded-full transition-colors ${
                    post.isBookmarked ? "text-blue-500 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Bookmark size={18} fill={post.isBookmarked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
