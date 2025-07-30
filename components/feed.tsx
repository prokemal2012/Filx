"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR, { mutate } from "swr"
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Eye } from "lucide-react"
import { LikeResponse, BookmarkResponse } from "@/types/api"

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface FeedProps {
  user: any
  onViewDocument: (doc: any) => void
}

export function Feed({ user, onViewDocument }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 20
  
  const { data: feedData, error, isLoading } = useSWR(`/api/feed?limit=${limit}&offset=${offset}`, fetcher)
  
  useEffect(() => {
    if (feedData && feedData.items) {
      if (offset === 0) {
        setPosts(feedData.items)
      } else {
        setPosts(prev => [...prev, ...feedData.items])
      }
      setHasMore(feedData.hasMore)
      setIsLoadingMore(false)
    }
  }, [feedData, offset])
  
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true)
      setOffset(prev => prev + limit)
    }
  }, [isLoadingMore, hasMore, limit])
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoadingMore) {
        return
      }
      loadMore()
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore, isLoadingMore])
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Feed</h1>
          <p className="text-gray-600">Discover the latest documents from people you follow</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Failed to load feed. Please try again later.</p>
        </div>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Feed</h1>
          <p className="text-gray-600">Discover the latest documents from people you follow</p>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-32 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleLike = async (postId: string) => {
    try {
      // Optimistic update
      const updatedPosts = posts.map((post: any) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post,
      )
      mutate("/api/interactions/feed", updatedPosts, false)

      // API call
      const response = await fetch("/api/interactions/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: postId })
      })

      if (!response.ok) {
        // Revert on error
        mutate("/api/interactions/feed")
      }
    } catch (error) {
      // Revert on error
      mutate("/api/interactions/feed")
    }
  }

  const handleBookmark = async (postId: string) => {
    try {
      // Optimistic update
      const updatedPosts = posts.map((post: any) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
      mutate("/api/interactions/feed", updatedPosts, false)

      // API call
      const response = await fetch("/api/interactions/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: postId })
      })

      if (!response.ok) {
        // Revert on error
        mutate("/api/interactions/feed")
      }
    } catch (error) {
      // Revert on error
      mutate("/api/interactions/feed")
    }
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
        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 mb-2">No posts in your feed yet.</p>
            <p className="text-sm text-gray-400">Follow some users to see their latest documents here!</p>
          </div>
        ) : (
          posts.map((post) => {
            if (post.type === 'activity' && post.data && post.data.user) {
              // Render activity
              let activityText = `${post.data.user.name} did something`;
              if (post.data.action === 'document_created' && post.data.document) {
                activityText = `${post.data.user.name} uploaded a new document: ${post.data.document.title}`;
              } else if (post.data.action === 'user.followed' && post.data.targetUser) {
                activityText = `${post.data.user.name} started following ${post.data.targetUser.name}`;
              } else if (post.data.action === 'user.gained_follower' && post.data.details && post.data.details.followerName) {
                activityText = `${post.data.details.followerName} started following ${post.data.user.name}`;
              }

              return (
                <div key={post.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="p-6">
                    <p className="text-gray-800">{activityText}</p>
                    <p className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              );
            } else if (post.type === 'recent_document' && post.data) {
              // Render document
              return (
                <div key={post.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <img src={post.data.author.avatarUrl || '/placeholder.svg'} alt={post.data.author.name} className="w-12 h-12 rounded-full" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.data.author.name}</h3>
                        <p className="text-sm text-gray-500">Posted on {new Date(post.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{post.data.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.data.description}</p>
                    <button onClick={() => onViewDocument(post.data)} className="text-blue-600 hover:underline">View Document</button>
                  </div>
                </div>
              );
            }
            return null;
          })
        )}
        
        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* End of feed message */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">You've reached the end of your feed!</p>
          </div>
        )}
      </div>
    </div>
  )
}
