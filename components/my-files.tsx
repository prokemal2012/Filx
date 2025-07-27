"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function MyFiles() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // *TODO: DATA* - Replace with real files data from server
  const files = []

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">My Files</h1>
        <div className="flex space-x-3">
          <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg">
            Upload
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">New Folder</Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700"}
          >
            List
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-blue-600 text-white" : "border-gray-300 text-gray-700"}
          >
            Grid
          </Button>
        </div>
        <Input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-80 px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Name</th>
                  <th className="text-left p-4 font-medium text-gray-700">Owner</th>
                  <th className="text-left p-4 font-medium text-gray-700">Last Modified</th>
                  <th className="text-left p-4 font-medium text-gray-700">File Size</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{file.type}</span>
                        </div>
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{file.owner}</td>
                    <td className="p-4 text-gray-600">{file.lastModified}</td>
                    <td className="p-4 text-gray-600">{file.fileSize}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                          Share
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 p-6">
            {filteredFiles.map((file, index) => (
              <div key={index} className="text-center p-4 hover:bg-gray-50 rounded-lg">
                <div className="w-16 h-20 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{file.type}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate mb-1">{file.name}</p>
                <p className="text-xs text-gray-500">{file.fileSize}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No files found.</p>
        </div>
      )}
    </div>
  )
}
