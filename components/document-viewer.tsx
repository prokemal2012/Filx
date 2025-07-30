"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { X, Download, Heart, Share, Bookmark, MessageCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// SWR fetcher function
import { useRouter } from 'next/navigation'

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json())

interface DocumentViewerProps {
  document: any
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const router = useRouter()
  const [comment, setComment] = useState("")
  // Fetch document details and interaction status
  const { data: documentData } = useSWR(`/api/documents/${document.id}`, fetcher)
  const { data: interactionStatus } = useSWR(`/api/interactions/status?documentId=${document.id}`, fetcher)
  const { data: commentsData, error: commentsError } = useSWR(`/api/documents/${document.id}/comments`, fetcher);
  const comments = commentsData?.comments || [];
  
  const isLiked = interactionStatus?.liked || false
  const isBookmarked = interactionStatus?.bookmarked || false

  const handleLike = async () => {
    try {
      // Optimistic update
      const newStatus = { ...interactionStatus, liked: !isLiked }
      mutate(`/api/interactions/status?documentId=${document.id}`, newStatus, false)
      
      // API call
      const response = await fetch("/api/interactions/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ documentId: document.id })
      })
      
      if (!response.ok) {
        mutate(`/api/interactions/status?documentId=${document.id}`)
      }
    } catch (error) {
      mutate(`/api/interactions/status?documentId=${document.id}`)
    }
  }
  
  const handleBookmark = async () => {
    try {
      // Optimistic update
      const newStatus = { ...interactionStatus, bookmarked: !isBookmarked }
      mutate(`/api/interactions/status?documentId=${document.id}`, newStatus, false)
      
      // API call
      const response = await fetch("/api/interactions/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ documentId: document.id })
      })
      
      if (!response.ok) {
        mutate(`/api/interactions/status?documentId=${document.id}`)
      }
    } catch (error) {
      mutate(`/api/interactions/status?documentId=${document.id}`)
    }
  }
  
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      const response = await fetch(`/api/documents/${document.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ content: comment })
      });
      
      if (response.ok) {
        setComment("");
        mutate(`/api/documents/${document.id}/comments`);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col lg:flex-row">
        {/* Document Preview */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-[300px] lg:min-h-0">
          <div className="text-center p-12">
            <div className="w-32 h-40 bg-white rounded-2xl shadow-lg mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{document.title}</h3>
            <p className="text-gray-600 mb-6">PDF Document • {document.pages || 24} pages</p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button onClick={() => { onClose(); router.push(`/document/${document.id}`); }} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-xl">
                <Eye size={16} className="mr-2" />
                View Full Document
              </Button>
              <Button onClick={() => window.open(`/api/document/download/${document.id}`, '_blank')} className="w-full sm:w-auto border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-3 rounded-xl">
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col max-h-[50vh] lg:max-h-none">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Document Details</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-4">
              <img src={documentData?.author?.avatar || document.author?.avatarUrl || "/placeholder.svg"} alt="Author" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-gray-900">{documentData?.author?.name || document.author?.name || "Loading..."}</h3>
                <p className="text-sm text-gray-500">@{documentData?.author?.username || document.author?.name?.toLowerCase().replace(' ', '') || 'unknown'} • {new Date(documentData?.createdAt || document.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4">
              {document.description ||
                "A comprehensive analysis of remote work trends and their impact on productivity."}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {documentData?.tags?.map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                  {tag}
                </span>
              )) || (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                  {document.category || "Category"}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleLike}
                className={`flex-1 ${
                  isLiked
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-gray-50 text-gray-700 border border-gray-200"
                } hover:bg-opacity-80 px-4 py-2 rounded-xl font-medium transition-colors`}
              >
                <Heart size={16} className="mr-2" fill={isLiked ? "currentColor" : "none"} />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button
                onClick={handleBookmark}
                className={`${
                  isBookmarked
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "bg-gray-50 text-gray-700 border border-gray-200"
                } hover:bg-opacity-80 px-4 py-2 rounded-xl transition-colors`}
              >
                <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
              </Button>
              <Button className="bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors">
                <Share size={16} />
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle size={18} className="mr-2" />
                Comments ({comments.length})
              </h3>

              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl resize-none text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-6 space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={comment.author.avatar || "/placeholder.svg"}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">{comment.author.name}</h4>
                          <span className="text-xs text-gray-500">@{comment.author.username}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
