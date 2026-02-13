import { useEffect, useState } from 'react'
import { pdfjs } from 'react-pdf'
import { X, Check, Eye, EyeSlash, ArrowsOutSimple, ArrowsInSimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { PDFDocument } from '@/lib/types'

interface AlignmentComparisonOverlayProps {
  document: PDFDocument
  currentPageIndex: number
  onClose: () => void
  onApplyExtractedText?: () => void
}

interface TextPosition {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  rawY: number
}

export function AlignmentComparisonOverlay({ 
  document: doc, 
  currentPageIndex, 
  onClose,
  onApplyExtractedText
}: AlignmentComparisonOverlayProps) {
  const [pdfTextPositions, setPdfTextPositions] = useState<TextPosition[]>([])
  const [extractedElements, setExtractedElements] = useState<TextPosition[]>([])
  const [showPdfText, setShowPdfText] = useState(true)
  const [showExtracted, setShowExtracted] = useState(true)
  const [pageHeight, setPageHeight] = useState(792)
  const [hasExtractedText, setHasExtractedText] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const [alignmentAccuracy, setAlignmentAccuracy] = useState<number | null>(null)

  useEffect(() => {
    extractPDFTextPositions()
    extractElementPositions()
  }, [doc, currentPageIndex])

  useEffect(() => {
    if (pdfTextPositions.length > 0 && extractedElements.length > 0) {
      calculateAlignmentAccuracy()
    }
  }, [pdfTextPositions, extractedElements])

  const extractPDFTextPositions = async () => {
    try {
      if (!doc.originalFile) return

      let pdfData: string | ArrayBuffer
      if (typeof doc.originalFile === 'string') {
        pdfData = doc.originalFile
      } else {
        pdfData = await doc.originalFile.arrayBuffer()
      }

      const loadingTask = pdfjs.getDocument(pdfData)
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(currentPageIndex + 1)
      const textContent = await page.getTextContent()
      const viewport = page.getViewport({ scale: 1.0 })
      
      setPageHeight(viewport.height)

      const positions: TextPosition[] = []
      
      textContent.items.forEach((item: any) => {
        if (item.str && item.str.trim()) {
          const transform = item.transform
          const scaleY = transform[3]
          const fontSize = Math.abs(scaleY)
          
          const x = transform[4]
          const rawY = transform[5]
          const y = viewport.height - rawY - fontSize
          
          positions.push({
            text: item.str,
            x: x,
            y: y,
            width: item.width,
            height: fontSize,
            fontSize: fontSize,
            rawY: rawY
          })
        }
      })

      setPdfTextPositions(positions)
    } catch (error) {
      console.error('Failed to extract PDF text positions:', error)
    }
  }

  const extractElementPositions = () => {
    const currentPage = doc.pages[currentPageIndex]
    if (!currentPage) return

    const extracted = currentPage.elements
      .filter(el => el.type === 'text' && el.data.isExtracted)
      .map(el => ({
        text: el.data.content || '',
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fontSize: el.data.fontSize || 12,
        rawY: 0
      }))

    setExtractedElements(extracted)
    setHasExtractedText(extracted.length > 0)
  }

  const calculateAlignmentAccuracy = () => {
    if (pdfTextPositions.length === 0 || extractedElements.length === 0) {
      setAlignmentAccuracy(null)
      return
    }

    let totalOffset = 0
    let matchCount = 0

    extractedElements.forEach(extracted => {
      const match = pdfTextPositions.find(pdf => 
        pdf.text.trim() === extracted.text.trim() &&
        Math.abs(pdf.x - extracted.x) < 50 &&
        Math.abs(pdf.y - extracted.y) < 50
      )

      if (match) {
        const xDiff = Math.abs(match.x - extracted.x)
        const yDiff = Math.abs(match.y - extracted.y)
        totalOffset += Math.sqrt(xDiff * xDiff + yDiff * yDiff)
        matchCount++
      }
    })

    if (matchCount > 0) {
      const avgOffset = totalOffset / matchCount
      const accuracy = Math.max(0, 100 - avgOffset)
      setAlignmentAccuracy(Math.round(accuracy))
    }
  }

  const handleApplyExtractedText = () => {
    if (!hasExtractedText) {
      toast.error('No extracted text found', {
        description: 'Use "Extract Text" first to create editable text elements'
      })
      return
    }

    if (onApplyExtractedText) {
      onApplyExtractedText()
      toast.success('✓ Switched to extracted text mode', {
        description: 'Original PDF text layer is hidden. Your editable extracted text will be used in exports.'
      })
      onClose()
    }
  }

  const handleViewModeChange = (mode: 'both' | 'pdf' | 'extracted') => {
    switch (mode) {
      case 'pdf':
        setShowPdfText(true)
        setShowExtracted(false)
        break
      case 'extracted':
        setShowPdfText(false)
        setShowExtracted(true)
        break
      case 'both':
        setShowPdfText(true)
        setShowExtracted(true)
        break
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Text Alignment Verification</h2>
              <p className="text-sm text-muted-foreground">
                Compare and toggle between original PDF and extracted text layers
              </p>
            </div>
            
            {alignmentAccuracy !== null && (
              <Badge 
                variant={alignmentAccuracy > 90 ? 'default' : alignmentAccuracy > 70 ? 'secondary' : 'destructive'}
                className="text-sm px-3 py-1"
              >
                {alignmentAccuracy}% Aligned
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              <Button
                variant={showPdfText && showExtracted ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('both')}
                className="gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                Both
              </Button>
              <Button
                variant={showPdfText && !showExtracted ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('pdf')}
                className="gap-1.5 text-blue-600 data-[state=active]:bg-blue-600"
              >
                PDF Only
              </Button>
              <Button
                variant={!showPdfText && showExtracted ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('extracted')}
                className="gap-1.5 text-red-600 data-[state=active]:bg-red-600"
              >
                Extracted Only
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className="gap-2"
              >
                {showBoundingBoxes ? <Eye className="h-4 w-4" /> : <EyeSlash className="h-4 w-4" />}
                {showBoundingBoxes ? 'Hide' : 'Show'} Boxes
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />
            
            <Button 
              variant="default" 
              onClick={handleApplyExtractedText}
              disabled={!hasExtractedText}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Apply & Hide Original
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Zoom:</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="h-7 w-7 p-0"
            >
              <ArrowsInSimple className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
              className="h-7 w-7 p-0"
            >
              <ArrowsOutSimple className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded border border-blue-700"></div>
              <span>PDF Text ({pdfTextPositions.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded border border-red-700"></div>
              <span>Extracted ({extractedElements.length})</span>
            </div>
          </div>

          {hasExtractedText && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Alert className="py-2 px-3 border-accent">
                <AlertDescription className="text-xs">
                  <strong>Ready to apply:</strong> Click "Apply & Hide Original" to use extracted text for cleaner exports
                </AlertDescription>
              </Alert>
            </>
          )}

          {!hasExtractedText && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Alert className="py-2 px-3 border-muted">
                <AlertDescription className="text-xs">
                  No extracted text found. Use "Extract Text" in the toolbar first.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <div className="flex-1 overflow-auto p-8 bg-muted/30">
          <div 
            className="mx-auto bg-white shadow-lg" 
            style={{ 
              width: `${612 * zoomLevel}px`, 
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
          >
            <svg 
              width={612 * zoomLevel} 
              height={pageHeight * zoomLevel} 
              style={{ display: 'block' }}
              viewBox={`0 0 612 ${pageHeight}`}
            >
              {showPdfText && pdfTextPositions.map((pos, i) => (
                <g key={`pdf-${i}`}>
                  {showBoundingBoxes && (
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.width}
                      height={pos.height}
                      fill="rgba(0, 100, 255, 0.12)"
                      stroke="rgb(0, 100, 255)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y + pos.fontSize * 0.75}
                    fontSize={pos.fontSize}
                    fill={showExtracted ? "rgba(0, 100, 255, 0.7)" : "rgb(0, 100, 255)"}
                    fontFamily="Arial"
                  >
                    {pos.text}
                  </text>
                  {showBoundingBoxes && (
                    <text
                      x={pos.x}
                      y={pos.y - 3}
                      fontSize="7"
                      fill="blue"
                      fontFamily="monospace"
                      opacity="0.8"
                    >
                      PDF y:{pos.y.toFixed(0)}
                    </text>
                  )}
                </g>
              ))}
              
              {showExtracted && extractedElements.map((pos, i) => (
                <g key={`ext-${i}`}>
                  {showBoundingBoxes && (
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.width}
                      height={pos.height}
                      fill="rgba(255, 0, 0, 0.12)"
                      stroke="rgb(255, 0, 0)"
                      strokeWidth="1.5"
                    />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y + pos.fontSize * 0.75}
                    fontSize={pos.fontSize}
                    fill={showPdfText ? "rgba(255, 0, 0, 0.85)" : "rgb(255, 0, 0)"}
                    fontFamily="Arial"
                    fontWeight={showPdfText ? "600" : "400"}
                  >
                    {pos.text}
                  </text>
                  {showBoundingBoxes && (
                    <text
                      x={pos.x + pos.width + 3}
                      y={pos.y + pos.height / 2 + 2}
                      fontSize="7"
                      fill="red"
                      fontFamily="monospace"
                      opacity="0.8"
                    >
                      Ext y:{pos.y.toFixed(0)}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="p-4 border-t bg-card/50">
          <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-blue-600">PDF Native Text</h3>
                <Badge variant="outline" className="text-blue-600">{pdfTextPositions.length} items</Badge>
              </div>
              <div className="text-xs space-y-1 font-mono max-h-24 overflow-y-auto bg-blue-50/50 p-2 rounded">
                {pdfTextPositions.slice(0, 8).map((pos, i) => (
                  <div key={i} className="text-blue-700 truncate" title={`"${pos.text}"`}>
                    <span className="font-semibold">"{pos.text.slice(0, 20)}{pos.text.length > 20 ? '...' : ''}"</span> @ 
                    x:{pos.x.toFixed(0)} y:{pos.y.toFixed(0)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-red-600">Extracted Overlay</h3>
                <Badge variant="outline" className="text-red-600">{extractedElements.length} items</Badge>
              </div>
              <div className="text-xs space-y-1 font-mono max-h-24 overflow-y-auto bg-red-50/50 p-2 rounded">
                {extractedElements.slice(0, 8).map((pos, i) => (
                  <div key={i} className="text-red-700 truncate" title={`"${pos.text}"`}>
                    <span className="font-semibold">"{pos.text.slice(0, 20)}{pos.text.length > 20 ? '...' : ''}"</span> @ 
                    x:{pos.x.toFixed(0)} y:{pos.y.toFixed(0)}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Alignment Status</h3>
              <div className="bg-muted/50 p-3 rounded space-y-2">
                {alignmentAccuracy !== null ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className={`font-bold ${alignmentAccuracy > 90 ? 'text-green-600' : alignmentAccuracy > 70 ? 'text-orange-600' : 'text-red-600'}`}>
                        {alignmentAccuracy}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alignmentAccuracy > 90 && '✓ Excellent alignment - ready to apply'}
                      {alignmentAccuracy > 70 && alignmentAccuracy <= 90 && '⚠ Good alignment with minor offsets'}
                      {alignmentAccuracy <= 70 && '⚠ Alignment needs calibration'}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No alignment data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
