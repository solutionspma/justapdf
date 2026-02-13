import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { DraggableElement } from '@/components/DraggableElement'
import { GridOverlay } from '@/components/GridOverlay'
import { snapPointToGrid, type GridSettings } from '@/lib/snapToGrid'
import type { PDFDocument, PDFElement, EditMode, PDFPage } from '@/lib/types'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFCanvasProps {
  document: PDFDocument
  currentPageIndex: number
  editMode: EditMode
  zoom: number
  selectedElement: PDFElement | null
  onSelectElement: (element: PDFElement | null) => void
  onAddElement: (element: Omit<PDFElement, 'id'>) => void
  onUpdateElement: (elementId: string, updates: Partial<PDFElement>) => void
  onDeleteElement: (elementId: string) => void
  onDocumentUpdate: (updater: (docs: PDFDocument[]) => PDFDocument[]) => void
  highlightColor?: string
  highlightOpacity?: number
  noteColor?: string
  annotationFilters?: {
    types: Record<string, boolean>
    authors: string[]
    showAllAuthors: boolean
  }
  gridSettings: GridSettings
  hideOriginalText?: boolean
}

export interface PDFCanvasRef {
  capturePageImage: () => Promise<string>
}

export const PDFCanvas = forwardRef<PDFCanvasRef, PDFCanvasProps>(({
  document: doc,
  currentPageIndex,
  editMode,
  zoom,
  selectedElement,
  onSelectElement,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onDocumentUpdate,
  highlightColor = '#FFEB3B',
  highlightOpacity = 0.4,
  noteColor = '#FFA726',
  annotationFilters,
  gridSettings,
  hideOriginalText = false
}, ref) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [fileUrl, setFileUrl] = useState<string>('')
  const [showTextDialog, setShowTextDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [newTextContent, setNewTextContent] = useState('')
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const pageCanvasRef = useRef<HTMLDivElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useImperativeHandle(ref, () => ({
    capturePageImage: async () => {
      if (!pageCanvasRef.current) {
        throw new Error('Page canvas not found')
      }
      
      const canvasElement = pageCanvasRef.current.querySelector('canvas')
      if (!canvasElement) {
        throw new Error('Could not find page canvas element')
      }

      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      tempCanvas.width = canvasElement.width
      tempCanvas.height = canvasElement.height
      
      ctx.drawImage(canvasElement, 0, 0)
      
      return tempCanvas.toDataURL('image/png')
    }
  }))

  useEffect(() => {
    if (!doc.originalFile) return
    
    if (typeof doc.originalFile === 'string') {
      setFileUrl(doc.originalFile)
    } else {
      try {
        const url = URL.createObjectURL(doc.originalFile)
        setFileUrl(url)
        return () => URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to create object URL:', error)
        toast.error('Failed to load PDF file')
      }
    }
  }, [doc.originalFile])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    
    if (doc.pages.length === 0) {
      const pages: PDFPage[] = Array.from({ length: numPages }, (_, i) => ({
        id: `page-${i}`,
        pageNumber: i + 1,
        width: 612,
        height: 792,
        rotation: 0,
        elements: []
      }))
      
      onDocumentUpdate((docs) =>
        docs.map((d) => (d.id === doc.id ? { ...d, pages } : d))
      )
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editMode === 'select') return

    const rect = e.currentTarget.getBoundingClientRect()
    let x = (e.clientX - rect.left) / zoom
    let y = (e.clientY - rect.top) / zoom
    
    const snapped = snapPointToGrid(x, y, gridSettings.size, gridSettings.enabled)
    x = snapped.x
    y = snapped.y
    
    setClickPosition({ x, y })

    if (editMode === 'text') {
      setShowTextDialog(true)
    } else if (editMode === 'image') {
      setShowImageDialog(true)
    } else if (editMode === 'signature') {
      setShowSignatureDialog(true)
    } else if (editMode === 'form') {
      onAddElement({
        type: 'form',
        x,
        y,
        width: 200,
        height: 40,
        rotation: 0,
        data: {
          fieldType: 'text',
          value: '',
          placeholder: 'Enter text...'
        },
        zIndex: Date.now()
      })
      toast.success('Form field added')
    } else if (editMode === 'highlight') {
      onAddElement({
        type: 'highlight',
        x,
        y,
        width: 200,
        height: 30,
        rotation: 0,
        data: {
          color: highlightColor,
          opacity: highlightOpacity
        },
        zIndex: Date.now()
      })
      toast.success('Highlight added')
    } else if (editMode === 'note') {
      onAddElement({
        type: 'note',
        x,
        y,
        width: 200,
        height: 150,
        rotation: 0,
        data: {
          content: 'New note',
          color: noteColor,
          author: 'You',
          createdAt: new Date().toISOString(),
          isOpen: true
        },
        zIndex: Date.now()
      })
      toast.success('Sticky note added')
    }
  }

  const handleAddText = () => {
    if (!clickPosition || !newTextContent) return

    onAddElement({
      type: 'text',
      x: clickPosition.x,
      y: clickPosition.y,
      width: 200,
      height: 40,
      rotation: 0,
      data: {
        content: newTextContent,
        fontSize: 16,
        fontFamily: 'Inter',
        color: '#000000',
        bold: false,
        italic: false
      },
      zIndex: Date.now()
    })

    setNewTextContent('')
    setShowTextDialog(false)
    setClickPosition(null)
    toast.success('Text added')
  }

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!clickPosition) return
    
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      
      onAddElement({
        type: 'image',
        x: clickPosition.x,
        y: clickPosition.y,
        width: 200,
        height: 200,
        rotation: 0,
        data: {
          src,
          opacity: 1
        },
        zIndex: Date.now()
      })

      setShowImageDialog(false)
      setClickPosition(null)
      toast.success('Image added')
    }
    reader.readAsDataURL(file)
  }

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const handleStopDrawing = () => {
    setIsDrawing(false)
  }

  const handleSaveSignature = () => {
    if (!clickPosition) return
    
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    
    const dataUrl = canvas.toDataURL()
    
    onAddElement({
      type: 'signature',
      x: clickPosition.x,
      y: clickPosition.y,
      width: 200,
      height: 100,
      rotation: 0,
      data: {
        src: dataUrl,
        signatureType: 'draw'
      },
      zIndex: Date.now()
    })

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    
    setShowSignatureDialog(false)
    setClickPosition(null)
    toast.success('Signature added')
  }

  const currentPage = doc.pages[currentPageIndex]
  let elements = currentPage?.elements || []
  
  const shouldHideOriginalText = hideOriginalText
  
  if (annotationFilters) {
    elements = elements.filter(el => {
      const typeMatch = annotationFilters.types[el.type as keyof typeof annotationFilters.types]
      const authorMatch = annotationFilters.showAllAuthors || 
        el.type !== 'note' || 
        !el.data.author ||
        annotationFilters.authors.includes(el.data.author)
      return typeMatch && authorMatch
    })
  }

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading PDF...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-6 min-h-full">
      <div
        ref={canvasRef}
        className="relative bg-white shadow-2xl"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        onClick={handleCanvasClick}
      >
        <div ref={pageCanvasRef}>
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            className="relative"
          >
            <Page
              pageNumber={currentPageIndex + 1}
              renderTextLayer={!shouldHideOriginalText}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>

        <GridOverlay
          width={currentPage?.width || 612}
          height={currentPage?.height || 792}
          zoom={zoom}
          gridSize={gridSettings.size}
          show={gridSettings.showGrid}
        />

        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            zoom={zoom}
            gridSettings={gridSettings}
            onSelect={() => onSelectElement(element)}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onDelete={() => onDeleteElement(element.id)}
            onDuplicate={() => {
              const newElement = {
                ...element,
                id: `element-${Date.now()}`,
                x: element.x + 20,
                y: element.y + 20,
                zIndex: Date.now()
              }
              onAddElement(newElement)
            }}
            onBringToFront={() => {
              onUpdateElement(element.id, { zIndex: Date.now() })
            }}
            onSendToBack={() => {
              onUpdateElement(element.id, { zIndex: 0 })
            }}
          />
        ))}
      </div>

      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter text..."
              value={newTextContent}
              onChange={(e) => setNewTextContent(e.target.value)}
              autoFocus
              rows={4}
              className="resize-y"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowTextDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddText} disabled={!newTextContent}>
                Add Text
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleAddImage}
              id="image-upload"
            />
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draw Signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <canvas
              ref={signatureCanvasRef}
              width={400}
              height={200}
              className="border border-border rounded bg-white cursor-crosshair"
              onMouseDown={handleStartDrawing}
              onMouseMove={handleDraw}
              onMouseUp={handleStopDrawing}
              onMouseLeave={handleStopDrawing}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSignatureDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const ctx = signatureCanvasRef.current?.getContext('2d')
                  if (ctx) {
                    ctx.clearRect(0, 0, 400, 200)
                  }
                }}
              >
                Clear
              </Button>
              <Button onClick={handleSaveSignature}>
                Save Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})

PDFCanvas.displayName = 'PDFCanvas'
