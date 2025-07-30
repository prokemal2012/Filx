"use client"

import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Download, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json())

interface DocumentPreviewProps {
  documentId: string
}

export function DocumentPreview({ documentId }: DocumentPreviewProps) {
  const router = useRouter()
  const { data: document, error } = useSWR(`/api/document/view/${documentId}?type=details`, fetcher)
  const [textContent, setTextContent] = useState('')

  useEffect(() => {
    if (document && (document.type === 'text/plain' || document.type === 'text/markdown')) {
      fetch(`/api/document/view/${documentId}`)
        .then(res => res.text())
        .then(setTextContent)
    }
  }, [document, documentId])

  useEffect(() => {
    // If document is not public and there's an error, redirect
    if (error) {
      router.push('/dashboard')
    }
  }, [error, router])

  if (error) return <div>Failed to load document. You may not have permission to view it.</div>
  if (!document) return <div>Loading...</div>

  const handleDownload = () => {
    window.open(`/api/document/download/${documentId}`, '_blank')
  }

  const getFileExtension = () => {
    if (!document?.fileName) return ''
    return document.fileName.split('.').pop()?.toLowerCase() || ''
  }

  const renderDocumentContent = () => {
    if (!document) return null

    const fileExtension = getFileExtension()
    const filePath = document.filePath.replace('/uploads/', '')

    // Handle text files
    if (document.type === 'text/plain' || document.type === 'text/markdown' || fileExtension === 'txt' || fileExtension === 'md') {
      return (
        <div className="h-full overflow-auto p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm">{textContent}</pre>
        </div>
      )
    }

    // Handle PDF files
    if (document.type === 'application/pdf' || fileExtension === 'pdf') {
      return (
        <iframe
          src={`/api/uploads/${filePath}`}
          title={document.title}
          width="100%"
          height="100%"
          className="border-0"
        />
      )
    }

    // Handle Office documents (Word, PowerPoint, Excel)
    if ([
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-powerpoint',
      'application/vnd.ms-excel'
    ].includes(document.type) || ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(fileExtension)) {
      // Use Office Online or Google Docs viewer for Office documents
      const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + `/api/uploads/${filePath}`)}`
      return (
        <iframe
          src={viewerUrl}
          title={document.title}
          width="100%"
          height="100%"
          className="border-0"
        />
      )
    }

    // Handle images
    if (document.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50">
          <img
            src={`/api/uploads/${filePath}`}
            alt={document.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )
    }

    // Default: try to display in iframe
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{document.title}</h3>
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
            <Download size={16} className="mr-2" />
            Download to View
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-6">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <Button onClick={() => router.back()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-base">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left flex-1 mx-4 truncate">
          {document.title}
        </h1>
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <div className="hidden sm:flex items-center text-gray-600">
            <Eye size={16} className="mr-2" /> {document.viewCount} views
          </div>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-base">
            <Download size={16} className="mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-2 sm:p-4" style={{ height: 'calc(100vh - 150px)' }}>
        {renderDocumentContent()}
      </div>
    </div>
  )
}
