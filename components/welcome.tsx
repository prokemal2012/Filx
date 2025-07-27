"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Welcome() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // *TODO: DATA* - Replace with real interests data from server
  const interests = []

  // *TODO: DATA* - Replace with real skills data from server
  const skills = []

  const toggleSelection = (id: string, type: "interests" | "skills") => {
    if (type === "interests") {
      setSelectedInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    } else {
      setSelectedSkills((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-white font-bold text-3xl">F</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to FileHub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            FileHub is a platform for users to upload, view, and download documents. You can also create a profile and
            discover new documents.
          </p>
        </div>

        <div className="space-y-12">
          {/* Select Your Interests */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Your Interests</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleSelection(interest.id, "interests")}
                  className={`p-4 rounded-2xl transition-all duration-200 ${
                    selectedInterests.includes(interest.id)
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                      : "glass hover:bg-white/30 text-gray-700"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{interest.emoji}</div>
                    <div className="text-sm font-medium">{interest.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Your Skills */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Your Skills</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => toggleSelection(skill.id, "skills")}
                  className={`p-4 rounded-2xl transition-all duration-200 ${
                    selectedSkills.includes(skill.id)
                      ? "bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg scale-105"
                      : "glass hover:bg-white/30 text-gray-700"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{skill.emoji}</div>
                    <div className="text-sm font-medium">{skill.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Get Started Button */}
          <div className="text-center">
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-2xl text-lg font-semibold shadow-2xl hover:scale-105 transition-all duration-200"
              disabled={selectedInterests.length === 0 && selectedSkills.length === 0}
            >
              Get Started
            </Button>
            <p className="text-sm text-gray-500 mt-4">You can always change these preferences later in your settings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
