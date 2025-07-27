"use client"

import { useState } from "react"
import { X, Download, Heart, Share, Bookmark, MessageCircle, Eye, ThumbsUp, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface DocumentViewerProps {
  document: any
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [comment, setComment] = useState("")
  // *TODO: DATA* - Replace with real comments data from server
  const [comments, setComments] = useState([])

  const handleAddComment = () => {
    if (comment.trim()) {
      // *TODO: DATA* - Replace with real user data and proper comment creation
      const newComment = {
        id: comments.length + 1,
        author: {
          name: "You", // Should be replaced with actual current user
          username: "you",
          avatar: "/placeholder.svg",
        },
        content: comment,
        timestamp: "Just now",
        likes: 0,
      }
      setComments([newComment, ...comments])
      setComment("")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Document Preview */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-12">
            <div className="w-32 h-40 bg-white rounded-2xl shadow-lg mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{document.title}</h3>
            <p className="text-gray-600 mb-6">PDF Document • {document.pages || 24} pages</p>
            <div className="flex items-center justify-center space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
                <Eye size={16} className="mr-2" />
                View Full Document
              </Button>
              <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl">
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Document Details</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Author Info */}
            {/* *TODO: DATA* - Replace with real document author data */}
            <div className="flex items-center space-x-3 mb-4">
              <img src="/placeholder.svg" alt="Author" className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-gray-900">Author Name</h3>
                <p className="text-sm text-gray-500">@username • timestamp</p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4">
              {document.description ||
                "A comprehensive analysis of remote work trends and their impact on productivity."}
            </p>

            {/* Tags */}
            {/* *TODO: DATA* - Replace with real document tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                {document.category || "Category"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsLiked(!isLiked)}
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
                onClick={() => setIsBookmarked(!isBookmarked)}
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
                        <div className="flex items-center space-x-4 mt-2">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                            <ThumbsUp size={14} />
                            <span className="text-xs">{comment.likes}</span>
                          </button>
                          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Reply</button>
                          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                            <Flag size={12} className="inline mr-1" />
                            Report
                          </button>
                        </div>
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
