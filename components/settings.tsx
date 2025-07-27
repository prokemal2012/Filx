"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function Settings() {
  const [activeSection, setActiveSection] = useState("account")
  // *TODO: DATA* - Replace with real user email from server
  const [email, setEmail] = useState("")
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")

  const sections = [
    { id: "account", label: "Account" },
    { id: "documents", label: "My Documents" },
    { id: "notifications", label: "Notifications" },
    { id: "privacy", label: "Privacy" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-8">Settings</h1>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Navigation */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg font-medium ${
                    activeSection === section.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Settings Content */}
        <div className="col-span-9">
          <div className="space-y-8">
            {activeSection === "account" && (
              <>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="flex space-x-3">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                          Update
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="flex space-x-3">
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                          Change
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Document</h2>
                  <p className="text-gray-600 mb-6">Submit a document for review to be featured on the platform.</p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                      <Input
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        placeholder="Enter document title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <Textarea
                        value={documentDescription}
                        onChange={(e) => setDocumentDescription(e.target.value)}
                        placeholder="Describe your document..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <p className="text-gray-500 mb-4">Drag and drop your file here, or click to browse</p>
                        <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg">
                          Choose File
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                      Submit for Review
                    </Button>
                  </div>
                </div>
              </>
            )}

            {activeSection === "documents" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Documents</h2>
                <p className="text-gray-600">Manage your uploaded documents and their visibility settings.</p>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications about document updates</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Comment Notifications</p>
                      <p className="text-sm text-gray-600">Get notified when someone comments on your documents</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Profile Visibility</p>
                      <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Document Sharing</p>
                      <p className="text-sm text-gray-600">Allow others to see documents you've shared</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
