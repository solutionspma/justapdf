import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from '@/components/ui/sonner'
import { UploadZone } from '@/components/UploadZone'
import { Toolbar } from '@/components/Toolbar'
import { Sidebar } from '@/components/Sidebar'
import { PDFCanvas } from '@/components/PDFCanvas'
import { PropertiesPanel } from '@/components/PropertiesPanel'
import { SearchDialog } from '@/components/SearchDialog'
import { SignatureVerificationPanel } from '@/components/SignatureVerificationPanel'
import { PageTemplatesDialog } from '@/components/PageTemplatesDialog'
import { AlignmentComparisonOverlay } from '@/components/AlignmentComparisonOverlay'
import { TextAlignmentDiffOverlay } from '@/components/TextAlignmentDiffOverlay'
import { AlignmentGuideOverlay } from '@/components/AlignmentGuideOverlay'
import { BaselineOffsetDialog } from '@/components/BaselineOffsetDialog'
import { GridSettingsDialog } from '@/components/GridSettingsDialog'
import { DocumentColorPaletteDialog } from '@/components/DocumentColorPaletteDialog'
import { CurrentPaletteIndicator } from '@/components/CurrentPaletteIndicator'
import { AnnotationFilters, filterElements, DEFAULT_FILTERS, type AnnotationFilter } from '@/components/AnnotationFilters'
import { ColorPresets } from '@/components/ColorPresets'
import { detectTextInImage, capturePageAsImage } from '@/lib/ocr'
import { extractAndAddTextElements } from '@/lib/pdfTextExtraction'
import { generateTestPDF } from '@/lib/testPdfGenerator'
import { DEFAULT_GRID_SETTINGS, type GridSettings } from '@/lib/snapToGrid'
import { mergeTextElementsIntoBlocks, replaceElementsWithMergedBlocks } from '@/lib/textMerging'
import type { DocumentColorPalette } from '@/lib/colorPalettes'
import { toast } from 'sonner'
import type { PDFDocument, EditMode, PDFElement, PageTemplate, PDFPage } from '@/lib/types'

function App() {
  const [documents, setDocuments] = useKV<PDFDocument[]>('pdf-documents', [])
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [editMode, setEditMode] = useState<EditMode>('select')
  const [selectedElement, setSelectedElement] = useState<PDFElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isOCRProcessing, setIsOCRProcessing] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [signatureVerificationOpen, setSignatureVerificationOpen] = useState(false)
  const [pageTemplatesOpen, setPageTemplatesOpen] = useState(false)
  const [baselineOffsetOpen, setBaselineOffsetOpen] = useState(false)
  const [colorPalettesOpen, setColorPalettesOpen] = useState(false)
  const [showAlignmentComparison, setShowAlignmentComparison] = useState(false)
  const [showAlignmentDiff, setShowAlignmentDiff] = useState(false)
  const [currentPalette, setCurrentPalette] = useKV<DocumentColorPalette | null>('document-color-palette', null)
  const [annotationFilters, setAnnotationFilters] = useState<AnnotationFilter>(DEFAULT_FILTERS)
  const [highlightColor, setHighlightColor] = useState('#FFEB3B')
  const [highlightOpacity, setHighlightOpacity] = useState(0.4)
  const [noteColor, setNoteColor] = useState('#FFA726')
  const [showOCRBanner, setShowOCRBanner] = useState(true)
  const [isExtractingText, setIsExtractingText] = useState(false)
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(false)
  const [gridSettings, setGridSettings] = useKV<GridSettings>('grid-settings', DEFAULT_GRID_SETTINGS)
  const [gridSettingsOpen, setGridSettingsOpen] = useState(false)
  const [useExtractedTextMode, setUseExtractedTextMode] = useKV<Record<string, boolean>>('extracted-text-mode', {})
  const historyRef = useRef<PDFDocument[][]>([])
  const historyIndexRef = useRef(0)
  const pdfCanvasRef = useRef<{ capturePageImage: () => Promise<string> } | null>(null)
  const isProgrammaticUpdateRef = useRef(false)

  useEffect(() => {
    if (!isProgrammaticUpdateRef.current && documents && documents.length > 0) {
      historyRef.current = [JSON.parse(JSON.stringify(documents))]
      historyIndexRef.current = 0
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setSearchOpen(true)
      }
      
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.shiftKey) {
          e.preventDefault()
          setGridSettings((current) => {
            const settings = current || DEFAULT_GRID_SETTINGS
            return { ...settings, enabled: !settings.enabled }
          })
          toast.info(gridSettings?.enabled ? 'Snap to grid disabled' : 'Snap to grid enabled')
        } else {
          e.preventDefault()
          setGridSettings((current) => {
            const settings = current || DEFAULT_GRID_SETTINGS
            return { ...settings, showGrid: !settings.showGrid }
          })
          toast.info(gridSettings?.showGrid ? 'Grid hidden' : 'Grid visible')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gridSettings?.enabled, gridSettings?.showGrid, setGridSettings])

  const currentDoc = documents?.find(doc => doc.id === currentDocId)

  const saveToHistory = (newDocuments: PDFDocument[]) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1)
    newHistory.push(JSON.parse(JSON.stringify(newDocuments)))
    
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      historyIndexRef.current++
    }
    
    historyRef.current = newHistory
  }

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      isProgrammaticUpdateRef.current = true
      setDocuments(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])))
      setTimeout(() => {
        isProgrammaticUpdateRef.current = false
      }, 0)
      toast.info('Undo')
    } else {
      toast.info('Nothing to undo')
    }
  }

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      isProgrammaticUpdateRef.current = true
      setDocuments(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])))
      setTimeout(() => {
        isProgrammaticUpdateRef.current = false
      }, 0)
      toast.info('Redo')
    } else {
      toast.info('Nothing to redo')
    }
  }

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      
      const newDoc: PDFDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        pages: [],
        originalFile: dataUrl
      }
      
      setDocuments((currentDocs) => {
        const newDocs = [...(currentDocs || []), newDoc]
        saveToHistory(newDocs)
        return newDocs
      })
      setCurrentDocId(newDoc.id)
      setCurrentPageIndex(0)
    }
    
    reader.readAsDataURL(file)
  }

  const handleDeletePage = (pageIndex: number) => {
    if (!currentDoc) return
    
    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => 
        doc.id === currentDocId 
          ? { ...doc, pages: doc.pages.filter((_, i) => i !== pageIndex) }
          : doc
      )
      saveToHistory(newDocs)
      return newDocs
    })
    
    if (currentPageIndex >= (currentDoc.pages.length - 1)) {
      setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
    }
  }

  const handleReorderPages = (fromIndex: number, toIndex: number) => {
    if (!currentDoc) return
    
    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== currentDocId) return doc
        
        const newPages = [...doc.pages]
        const [movedPage] = newPages.splice(fromIndex, 1)
        newPages.splice(toIndex, 0, movedPage)
        
        return { ...doc, pages: newPages }
      })
      saveToHistory(newDocs)
      return newDocs
    })
  }

  const handleRotatePage = (pageIndex: number, degrees: number) => {
    if (!currentDoc) return
    
    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== currentDocId) return doc
        
        return {
          ...doc,
          pages: doc.pages.map((page, i) => 
            i === pageIndex 
              ? { ...page, rotation: (page.rotation + degrees) % 360 }
              : page
          )
        }
      })
      saveToHistory(newDocs)
      return newDocs
    })
  }

  const handleAddElement = (element: Omit<PDFElement, 'id'>) => {
    if (!currentDoc) return
    
    const newElement: PDFElement = {
      ...element,
      id: `element-${Date.now()}`
    }
    
    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== currentDocId) return doc
        
        return {
          ...doc,
          pages: doc.pages.map((page, i) => 
            i === currentPageIndex 
              ? { ...page, elements: [...page.elements, newElement] }
              : page
          )
        }
      })
      saveToHistory(newDocs)
      return newDocs
    })
  }

  const handleUpdateElement = (elementId: string, updates: Partial<PDFElement>) => {
    if (!currentDoc) return
    
    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== currentDocId) return doc
        
        return {
          ...doc,
          pages: doc.pages.map((page, i) => 
            i === currentPageIndex 
              ? { 
                  ...page, 
                  elements: page.elements.map(el => 
                    el.id === elementId ? { ...el, ...updates } : el
                  ) 
                }
              : page
          )
        }
      })
      saveToHistory(newDocs)
      return newDocs
    })
  }

  const handleDeleteElement = (elementId: string) => {
    if (!currentDoc) return
    
    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== currentDocId) return doc
        
        return {
          ...doc,
          pages: doc.pages.map((page, i) => 
            i === currentPageIndex 
              ? { ...page, elements: page.elements.filter(el => el.id !== elementId) }
              : page
          )
        }
      })
      saveToHistory(newDocs)
      return newDocs
    })
    setSelectedElement(null)
  }

  const handleExtractText = async () => {
    if (!currentDoc || isExtractingText) return
    
    setIsExtractingText(true)
    const toastId = toast.loading('Extracting text from PDF...', {
      description: 'Reading embedded text from the PDF file'
    })
    
    try {
      if (!currentDoc.originalFile) {
        toast.error('No PDF file loaded', { id: toastId })
        setIsExtractingText(false)
        return
      }

      let pdfData: string | ArrayBuffer
      
      if (typeof currentDoc.originalFile === 'string') {
        pdfData = currentDoc.originalFile
      } else {
        pdfData = await currentDoc.originalFile.arrayBuffer()
      }

      const textElements = await extractAndAddTextElements(pdfData, currentPageIndex)
      
      if (textElements.length === 0) {
        toast.info('No embedded text found on this page', { 
          id: toastId,
          description: 'This page may be blank or contain only images. Try another page or use page templates to add new text.'
        })
        setIsExtractingText(false)
        return
      }

      setDocuments((currentDocs) => {
        const newDocs = (currentDocs || []).map(doc => {
          if (doc.id !== currentDocId) return doc
          
          return {
            ...doc,
            pages: doc.pages.map((page, i) => {
              if (i !== currentPageIndex) return page
              
              const newElements = textElements.map((el, idx) => ({
                ...el,
                id: `element-${Date.now()}-${idx}`
              }))
              
              return { 
                ...page, 
                elements: [...page.elements, ...newElements]
              }
            })
          }
        })
        saveToHistory(newDocs)
        return newDocs
      })
      
      setSelectedElement(null)
      setIsExtractingText(false)
      
      toast.success(`✓ Extracted ${textElements.length} text element${textElements.length === 1 ? '' : 's'}!`, { 
        id: toastId,
        description: 'Text is now editable. Click any text to select and modify. Use Find & Replace to search.'
      })
    } catch (error: any) {
      console.error('Text extraction error:', error)
      setIsExtractingText(false)
      
      toast.error('Text extraction failed', { 
        id: toastId,
        description: error?.message || 'Could not extract text from this PDF. The file may be corrupted or password-protected.'
      })
    }
  }

  const handleNavigateToResult = (docId: string, pageIndex: number, elementId: string) => {
    if (docId !== currentDocId) {
      setCurrentDocId(docId)
    }
    setCurrentPageIndex(pageIndex)
    
    const doc = documents?.find(d => d.id === docId)
    if (!doc) return
    
    const page = doc.pages[pageIndex]
    const element = page?.elements.find(el => el.id === elementId)
    if (element) {
      setSelectedElement(element)
    }
  }

  const handleReplaceText = (docId: string, pageIndex: number, elementId: string, newText: string) => {
    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== docId) return doc
        
        return {
          ...doc,
          pages: doc.pages.map((page, i) => {
            if (i !== pageIndex) return page
            
            return {
              ...page,
              elements: page.elements.map(el => {
                if (el.id !== elementId || el.type !== 'text') return el
                
                return {
                  ...el,
                  data: {
                    ...el.data,
                    content: newText
                  }
                }
              })
            }
          })
        }
      })
      saveToHistory(newDocs)
      return newDocs
    })
  }

  const handleAddPageFromTemplate = (template: PageTemplate) => {
    if (!currentDoc) return
    
    const newPage: PDFPage = {
      id: `page-${Date.now()}`,
      pageNumber: currentDoc.pages.length + 1,
      width: template.width,
      height: template.height,
      rotation: 0,
      elements: template.elements.map((el, idx) => ({
        ...el,
        id: `element-${Date.now()}-${idx}`
      }))
    }
    
    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc =>
        doc.id === currentDocId
          ? { ...doc, pages: [...doc.pages, newPage] }
          : doc
      )
      saveToHistory(newDocs)
      return newDocs
    })
    
    setCurrentPageIndex(currentDoc.pages.length)
    toast.success(`Added page from ${template.name} template`)
  }

  const handleGenerateTestPDF = async () => {
    try {
      const testPdfUrl = await generateTestPDF()
      
      const response = await fetch(testPdfUrl)
      const blob = await response.blob()
      const file = new File([blob], 'test-alignment.pdf', { type: 'application/pdf' })
      
      handleFileUpload(file)
      
      toast.success('Test PDF generated with precisely positioned text!', {
        description: 'Click "Extract Text" to test alignment accuracy'
      })
    } catch (error) {
      console.error('Failed to generate test PDF:', error)
      toast.error('Failed to generate test PDF')
    }
  }

  const handleApplyBaselineOffset = (offset: number, applyToAll: boolean) => {
    if (!currentDoc) return

    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== currentDocId) return doc

        return {
          ...doc,
          pages: doc.pages.map((page, pageIndex) => {
            if (!applyToAll && pageIndex !== currentPageIndex) return page

            return {
              ...page,
              elements: page.elements.map(el => {
                if (el.type === 'text' && el.data.isExtracted) {
                  const currentOffset = el.data.baselineOffset || 0
                  return {
                    ...el,
                    y: el.y - currentOffset + offset,
                    data: {
                      ...el.data,
                      baselineOffset: offset
                    }
                  }
                }
                return el
              })
            }
          })
        }
      })
      saveToHistory(newDocs)
      return newDocs
    })

    const scope = applyToAll ? 'all pages' : 'current page'
    toast.success(`Applied baseline offset: ${offset.toFixed(1)}px to ${scope}`)
  }

  const handleCalibrateLetterSpacing = () => {
    if (!currentDoc) return

    let calibratedCount = 0

    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== currentDocId) return doc

        return {
          ...doc,
          pages: doc.pages.map((page, pageIndex) => {
            if (pageIndex !== currentPageIndex) return page

            return {
              ...page,
              elements: page.elements.map(el => {
                if (el.type === 'text' && el.data.isExtracted && el.data.pdfWidth && el.data.content.length > 0) {
                  const targetWidth = el.data.pdfWidth
                  const charCount = el.data.content.length
                  const baseCharWidth = el.data.fontSize * 0.6
                  const totalCharWidth = baseCharWidth * charCount
                  const neededLetterSpacing = (targetWidth - totalCharWidth) / Math.max(1, charCount - 1)
                  
                  calibratedCount++
                  
                  return {
                    ...el,
                    data: {
                      ...el.data,
                      letterSpacing: neededLetterSpacing
                    }
                  }
                }
                return el
              })
            }
          })
        }
      })
      saveToHistory(newDocs)
      return newDocs
    })

    if (calibratedCount > 0) {
      toast.success(`✓ Calibrated letter spacing for ${calibratedCount} text element${calibratedCount === 1 ? '' : 's'}`, {
        description: 'Character spacing adjusted for perfect alignment'
      })
    } else {
      toast.info('No extracted text elements found on this page', {
        description: 'Use "Extract Text" first to extract text from the PDF'
      })
    }
  }

  const handleApplyExtractedText = () => {
    if (!currentDoc) return

    setUseExtractedTextMode((current) => ({
      ...current,
      [currentDoc.id]: true
    }))

    toast.success('Switched to extracted text mode', {
      description: 'Original PDF text layer is now hidden. Your extracted text will be displayed and exported.'
    })
  }

  const handleToggleExtractedTextMode = () => {
    if (!currentDoc) return
    
    const isCurrentlyEnabled = useExtractedTextMode?.[currentDoc.id] || false
    
    setUseExtractedTextMode((current) => ({
      ...current,
      [currentDoc.id]: !isCurrentlyEnabled
    }))

    if (!isCurrentlyEnabled) {
      toast.success('Extracted text mode enabled', {
        description: 'Original PDF text is hidden'
      })
    } else {
      toast.info('Original PDF text restored', {
        description: 'Both PDF and extracted text are now visible'
      })
    }
  }

  const handleApplyColorPalette = (palette: DocumentColorPalette) => {
    setCurrentPalette(palette)
    
    if (palette.textColors?.heading) {
      setNoteColor(palette.colors.accent)
    }
    if (palette.highlightColors?.important) {
      setHighlightColor(palette.highlightColors.important)
    }
    
    toast.success(`Applied ${palette.name} palette`, {
      description: 'Use palette colors when adding new elements'
    })
  }

  const handleMergeTextElements = () => {
    if (!currentDoc) return

    const currentPage = currentDoc.pages[currentPageIndex]
    if (!currentPage) return

    const extractedTextElements = currentPage.elements.filter(
      el => el.type === 'text' && el.data.isExtracted && !el.data.isMerged
    )

    if (extractedTextElements.length === 0) {
      toast.info('No extracted text to merge', {
        description: 'Use "Extract Text" first to create text elements'
      })
      return
    }

    if (extractedTextElements.length === 1) {
      toast.info('Only one text element found', {
        description: 'Nothing to merge - the text is already a single element'
      })
      return
    }

    const blocks = mergeTextElementsIntoBlocks(currentPage.elements, 5)

    if (blocks.length === 0) {
      toast.error('Could not merge text elements', {
        description: 'No valid text blocks could be created'
      })
      return
    }

    if (blocks.length >= extractedTextElements.length) {
      toast.info('Text elements are already well-separated', {
        description: `${extractedTextElements.length} elements would create ${blocks.length} blocks - no merging needed`
      })
      return
    }

    setDocuments((currentDocs) => {
      const newDocs = (currentDocs || []).map(doc => {
        if (doc.id !== currentDocId) return doc

        return {
          ...doc,
          pages: doc.pages.map((page, pageIndex) => {
            if (pageIndex !== currentPageIndex) return page

            const newElements = replaceElementsWithMergedBlocks(page.elements, blocks)

            return {
              ...page,
              elements: newElements
            }
          })
        }
      })
      saveToHistory(newDocs)
      return newDocs
    })

    setSelectedElement(null)

    const reduction = extractedTextElements.length - blocks.length
    const reductionPercent = Math.round((reduction / extractedTextElements.length) * 100)

    toast.success(`✓ Merged ${extractedTextElements.length} text elements into ${blocks.length} editable block${blocks.length === 1 ? '' : 's'}!`, {
      description: `${reduction} fewer elements (${reductionPercent}% reduction) - Double-click any block to edit freely with line breaks`
    })
  }

  if (!currentDoc) {
    return (
      <div className="h-screen w-screen bg-background">
        <UploadZone onFileUpload={handleFileUpload} />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      <Toolbar
        editMode={editMode}
        onEditModeChange={setEditMode}
        zoom={zoom}
        onZoomChange={setZoom}
        currentDoc={currentDoc}
        currentPageIndex={currentPageIndex}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOCR={handleExtractText}
        isOCRProcessing={isExtractingText}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSignatureVerification={() => setSignatureVerificationOpen(true)}
        onOpenPageTemplates={() => setPageTemplatesOpen(true)}
        onGenerateTestPDF={handleGenerateTestPDF}
        onShowAlignmentComparison={() => setShowAlignmentComparison(true)}
        onShowAlignmentDiff={() => setShowAlignmentDiff(true)}
        onOpenBaselineOffset={() => setBaselineOffsetOpen(true)}
        onShowAlignmentGuides={() => setShowAlignmentGuides(true)}
        onCalibrateLetterSpacing={handleCalibrateLetterSpacing}
        gridSettings={gridSettings || DEFAULT_GRID_SETTINGS}
        onOpenGridSettings={() => setGridSettingsOpen(true)}
        onOpenColorPalettes={() => setColorPalettesOpen(true)}
        useExtractedTextMode={useExtractedTextMode?.[currentDoc.id] || false}
        onToggleExtractedTextMode={handleToggleExtractedTextMode}
        onMergeTextElements={handleMergeTextElements}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          pages={currentDoc.pages}
          currentPageIndex={currentPageIndex}
          onPageSelect={setCurrentPageIndex}
          onDeletePage={handleDeletePage}
          onReorderPages={handleReorderPages}
          onRotatePage={handleRotatePage}
          documentName={currentDoc.name}
        />
        
        <main className="flex-1 overflow-auto bg-muted/30 relative">
          {showOCRBanner && currentDoc.name.toLowerCase().includes('test') && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-2xl">
              <div className="bg-accent/95 backdrop-blur-sm border-2 border-accent text-accent-foreground rounded-lg shadow-xl p-4 flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">✓ Test Document Loaded</p>
                  <p className="text-xs opacity-90">
                    Click <strong>"Extract Text"</strong> in the toolbar to extract embedded text from this PDF. The text will become editable elements on the page.
                  </p>
                </div>
                <button
                  onClick={() => setShowOCRBanner(false)}
                  className="text-accent-foreground/60 hover:text-accent-foreground text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
            {currentPalette && (
              <CurrentPaletteIndicator
                palette={currentPalette}
                onOpenPalettes={() => setColorPalettesOpen(true)}
                onClear={() => setCurrentPalette(null)}
              />
            )}
            
            <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2">
              <AnnotationFilters
                elements={currentDoc.pages[currentPageIndex]?.elements || []}
                activeFilters={annotationFilters}
                onFiltersChange={setAnnotationFilters}
              />
              {(editMode === 'highlight' || editMode === 'note') && (
                <ColorPresets
                  value={editMode === 'highlight' ? highlightColor : noteColor}
                  onChange={(color) => {
                    if (editMode === 'highlight') {
                      setHighlightColor(color)
                    } else {
                      setNoteColor(color)
                    }
                  }}
                  opacity={editMode === 'highlight' ? highlightOpacity : undefined}
                  onOpacityChange={editMode === 'highlight' ? setHighlightOpacity : undefined}
                  showOpacity={editMode === 'highlight'}
                />
              )}
            </div>
          </div>
          <PDFCanvas
            ref={pdfCanvasRef}
            document={currentDoc}
            currentPageIndex={currentPageIndex}
            editMode={editMode}
            zoom={zoom}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onAddElement={handleAddElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDocumentUpdate={setDocuments}
            highlightColor={highlightColor}
            highlightOpacity={highlightOpacity}
            noteColor={noteColor}
            annotationFilters={annotationFilters}
            gridSettings={gridSettings || DEFAULT_GRID_SETTINGS}
            hideOriginalText={useExtractedTextMode?.[currentDoc.id] || false}
          />
        </main>
        
        {selectedElement && !signatureVerificationOpen && (
          <PropertiesPanel
            element={selectedElement}
            onUpdateElement={(updates) => handleUpdateElement(selectedElement.id, updates)}
            onClose={() => setSelectedElement(null)}
          />
        )}
        
        {signatureVerificationOpen && (
          <SignatureVerificationPanel
            document={currentDoc}
            onClose={() => setSignatureVerificationOpen(false)}
          />
        )}
      </div>
      
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        documents={documents || []}
        currentDocId={currentDocId}
        currentPageIndex={currentPageIndex}
        onNavigateToResult={handleNavigateToResult}
        onReplaceText={handleReplaceText}
      />
      
      <PageTemplatesDialog
        open={pageTemplatesOpen}
        onOpenChange={setPageTemplatesOpen}
        onSelectTemplate={handleAddPageFromTemplate}
      />

      <BaselineOffsetDialog
        open={baselineOffsetOpen}
        onOpenChange={setBaselineOffsetOpen}
        document={currentDoc}
        currentPageIndex={currentPageIndex}
        onApplyOffset={handleApplyBaselineOffset}
      />
      
      {showAlignmentComparison && (
        <AlignmentComparisonOverlay
          document={currentDoc}
          currentPageIndex={currentPageIndex}
          onClose={() => setShowAlignmentComparison(false)}
          onApplyExtractedText={handleApplyExtractedText}
        />
      )}

      {showAlignmentDiff && (
        <TextAlignmentDiffOverlay
          document={currentDoc}
          currentPageIndex={currentPageIndex}
          onClose={() => setShowAlignmentDiff(false)}
        />
      )}

      {showAlignmentGuides && currentDoc && (
        <AlignmentGuideOverlay
          elements={currentDoc.pages[currentPageIndex]?.elements || []}
          pageWidth={currentDoc.pages[currentPageIndex]?.width || 612}
          pageHeight={currentDoc.pages[currentPageIndex]?.height || 792}
          zoom={zoom}
          onClose={() => setShowAlignmentGuides(false)}
        />
      )}
      
      <GridSettingsDialog
        open={gridSettingsOpen}
        onOpenChange={setGridSettingsOpen}
        settings={gridSettings || DEFAULT_GRID_SETTINGS}
        onSettingsChange={setGridSettings}
      />
      
      <DocumentColorPaletteDialog
        open={colorPalettesOpen}
        onOpenChange={setColorPalettesOpen}
        onSelectPalette={handleApplyColorPalette}
        currentPaletteId={currentPalette?.id}
      />
      
      <Toaster />
    </div>
  )
}

export default App
