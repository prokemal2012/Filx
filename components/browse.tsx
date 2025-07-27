"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Browse() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // *TODO: DATA* - Replace with real categories data from server
  const categories = []

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
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Browse Documents</h1>
        <div className="flex space-x-4">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Search</Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Categories Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedCategory === category.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="col-span-9">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Showing {filteredDocuments.length} documents</p>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Most Recent</option>
              <option>Most Downloaded</option>
              <option>Alphabetical</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm">
                <div className="w-full h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-3xl">📄</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {doc.author}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>{doc.category}</span>
                  <span>{doc.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{doc.downloads} downloads</span>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-xs">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No documents found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
