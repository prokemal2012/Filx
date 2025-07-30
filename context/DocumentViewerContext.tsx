"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface DocumentViewerContextType {
  selectedDocument: any
  setSelectedDocument: (doc: any) => void
  closeDocument: () => void
}

const DocumentViewerContext = createContext<DocumentViewerContextType | undefined>(undefined)

export function DocumentViewerProvider({ children }: { children: ReactNode }) {
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  const closeDocument = () => {
    setSelectedDocument(null)
  }

  return (
    <DocumentViewerContext.Provider value={{
      selectedDocument,
      setSelectedDocument,
      closeDocument
    }}>
      {children}
    </DocumentViewerContext.Provider>
  )
}

export function useDocumentViewer() {
  const context = useContext(DocumentViewerContext)
  if (context === undefined) {
    throw new Error('useDocumentViewer must be used within a DocumentViewerProvider')
  }
  return context
}
