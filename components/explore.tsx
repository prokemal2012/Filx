"use client"

import { useState } from "react"
import { Search, TrendingUp, Filter, Eye, Heart, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ExploreProps {
  onViewDocument: (doc: any) => void
}

export function Explore({ onViewDocument }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // *TODO: DATA* - Replace with real categories data from server
  const categories = []

  // *TODO: DATA* - Replace with real trending topics from server
  const trendingTopics = []

  // *TODO: DATA* - Replace with real documents data from server
  const documents = []

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Explore</h1>
        <p className="text-gray-600">Discover trending documents and new creators</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search documents, authors, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="col-span-3 space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Filter size={18} className="mr-2" />
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp size={18} className="mr-2" />
              Trending
            </h3>
            <div className="space-y-2">
              {trendingTopics.map((topic, index) => (
                <button
                  key={index}
                  className="block w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  #{topic.replace(" ", "").toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredDocuments.length} documents
              {selectedCategory !== "all" && ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
            </p>
            <select className="border border-gray-300 rounded-xl px-4 py-2 text-sm bg-white">
              <option>Most Popular</option>
              <option>Most Recent</option>
              <option>Most Downloaded</option>
              <option>Highest Rated</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-lg">
                      {doc.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-lg">{doc.type}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                        <Eye size={20} className="text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{doc.title}</h3>

                  <div className="flex items-center space-x-2 mb-4">
                    <img
                      src={doc.authorAvatar || "/placeholder.svg"}
                      alt={doc.author}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600">{doc.author}</span>
                    {doc.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{doc.pages} pages</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart size={14} />
                        <span>{doc.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download size={14} />
                        <span>{doc.downloads}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-medium transition-colors">
                    View Document
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or browse different categories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
