"use client"

import { ExclamationCircle } from "lucide-react"

interface ErrorProps {
  message: string
}

export function ErrorPage({ message }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <ExclamationCircle size={48} className="text-red-600 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl font-medium transition-colors" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  )
}

