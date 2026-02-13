import { useEffect, useState } from 'react'
import { pdfjs } from 'react-pdf'
import { X, Eye, EyeSlash, ArrowsOutSimple, ArrowsInSimple, Warning, ArrowSquareOut } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import type { PDFDocument } from '@/lib/types'

export interface AlignmentUpdate {
  elementId: string
  x: number
  y: number
}

interface TextAlignmentDiffOverlayProps {
  document: PDFDocument
  currentPageIndex: number
  onClose: () => void
  onApplyAlignment?: (updates: AlignmentUpdate[]) => void
}

interface TextPosition {
  text: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  id: string
  elementId?: string
}

interface MismatchInfo {
  pdfText: TextPosition
  extractedText: TextPosition | null
  xOffset: number
  yOffset: number
  totalOffset: number
  severity: 'low' | 'medium' | 'high'
}

export function TextAlignmentDiffOverlay({ 
  document: doc, 
  currentPageIndex, 
  onClose,
  onApplyAlignment
}: TextAlignmentDiffOverlayProps) {
  const [pdfTextPositions, setPdfTextPositions] = useState<TextPosition[]>([])
  const [extractedElements, setExtractedElements] = useState<TextPosition[]>([])
  const [mismatches, setMismatches] = useState<MismatchInfo[]>([])
  const [pageHeight, setPageHeight] = useState(792)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showDiffOverlay, setShowDiffOverlay] = useState(true)
  const [highlightSeverity, setHighlightSeverity] = useState<'all' | 'medium' | 'high'>('all')
  const [toleranceThreshold, setToleranceThreshold] = useState(2)
  const [selectedMismatch, setSelectedMismatch] = useState<MismatchInfo | null>(null)

  useEffect(() => {
    extractPDFTextPositions()
    extractElementPositions()
  }, [doc, currentPageIndex])

  useEffect(() => {
    if (pdfTextPositions.length > 0 && extractedElements.length > 0) {
      calculateMismatches()
    }
  }, [pdfTextPositions, extractedElements, toleranceThreshold])

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
      
      textContent.items.forEach((item: any, index: number) => {
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
            id: `pdf-${index}`
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
      .map((el, index) => ({
        text: el.data.content || '',
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fontSize: el.data.fontSize || 12,
        id: `ext-${index}`,
        elementId: el.id
      }))

    setExtractedElements(extracted)
  }

  const calculateMismatches = () => {
    const mismatchList: MismatchInfo[] = []

    pdfTextPositions.forEach(pdfText => {
      const match = extractedElements.find(ext => 
        ext.text.trim() === pdfText.text.trim() &&
        Math.abs(ext.x - pdfText.x) < 100 &&
        Math.abs(ext.y - pdfText.y) < 100
      )

      if (match) {
        const xOffset = Math.abs(match.x - pdfText.x)
        const yOffset = Math.abs(match.y - pdfText.y)
        const totalOffset = Math.sqrt(xOffset * xOffset + yOffset * yOffset)

        if (totalOffset > toleranceThreshold) {
          let severity: 'low' | 'medium' | 'high' = 'low'
          if (totalOffset > 10) severity = 'high'
          else if (totalOffset > 5) severity = 'medium'

          mismatchList.push({
            pdfText,
            extractedText: match,
            xOffset,
            yOffset,
            totalOffset,
            severity
          })
        }
      } else {
        mismatchList.push({
          pdfText,
          extractedText: null,
          xOffset: 0,
          yOffset: 0,
          totalOffset: 0,
          severity: 'high'
        })
      }
    })

    extractedElements.forEach(extText => {
      const match = pdfTextPositions.find(pdf => 
        pdf.text.trim() === extText.text.trim() &&
        Math.abs(pdf.x - extText.x) < 100 &&
        Math.abs(pdf.y - extText.y) < 100
      )

      if (!match) {
        mismatchList.push({
          pdfText: extText,
          extractedText: null,
          xOffset: 0,
          yOffset: 0,
          totalOffset: 0,
          severity: 'high'
        })
      }
    })

    setMismatches(mismatchList)
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return { fill: 'rgba(255, 200, 0, 0.2)', stroke: 'rgb(255, 200, 0)' }
      case 'medium': return { fill: 'rgba(255, 140, 0, 0.25)', stroke: 'rgb(255, 140, 0)' }
      case 'high': return { fill: 'rgba(255, 0, 0, 0.3)', stroke: 'rgb(255, 0, 0)' }
    }
  }

  const shouldShowMismatch = (mismatch: MismatchInfo) => {
    if (highlightSeverity === 'all') return true
    if (highlightSeverity === 'medium') return mismatch.severity === 'medium' || mismatch.severity === 'high'
    if (highlightSeverity === 'high') return mismatch.severity === 'high'
    return false
  }

  const filteredMismatches = mismatches.filter(shouldShowMismatch)
  const highSeverityCount = mismatches.filter(m => m.severity === 'high').length
  const mediumSeverityCount = mismatches.filter(m => m.severity === 'medium').length
  const lowSeverityCount = mismatches.filter(m => m.severity === 'low').length

  const alignableMismatches = mismatches.filter(m => m.extractedText && m.extractedText.elementId)
  const alignmentUpdates: AlignmentUpdate[] = alignableMismatches.map(m => ({
    elementId: m.extractedText!.elementId!,
    x: m.pdfText.x,
    y: m.pdfText.y
  }))

  const handleAlignAll = () => {
    if (alignmentUpdates.length === 0 || !onApplyAlignment) return
    onApplyAlignment(alignmentUpdates)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Warning className="h-5 w-5 text-orange-500" weight="fill" />
                Text Alignment Diff Analyzer
              </h2>
              <p className="text-sm text-muted-foreground">
                Visual highlighting of misaligned text elements between PDF and extracted layers
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onApplyAlignment && alignmentUpdates.length > 0 && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAlignAll}
                  className="gap-2"
                >
                  <ArrowSquareOut className="h-4 w-4" />
                  Align All & Save ({alignmentUpdates.length})
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}
            <Button
              variant={showDiffOverlay ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDiffOverlay(!showDiffOverlay)}
              className="gap-2"
            >
              {showDiffOverlay ? <Eye className="h-4 w-4" /> : <EyeSlash className="h-4 w-4" />}
              {showDiffOverlay ? 'Hide' : 'Show'} Diff Overlay
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 border-b">
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

          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">Severity Filter:</Label>
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              <Button
                variant={highlightSeverity === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setHighlightSeverity('all')}
                className="h-7 px-3 text-xs"
              >
                All
              </Button>
              <Button
                variant={highlightSeverity === 'medium' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setHighlightSeverity('medium')}
                className="h-7 px-3 text-xs"
              >
                Medium+
              </Button>
              <Button
                variant={highlightSeverity === 'high' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setHighlightSeverity('high')}
                className="h-7 px-3 text-xs"
              >
                Critical Only
              </Button>
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Tolerance:</Label>
            <Slider
              value={[toleranceThreshold]}
              onValueChange={([value]) => setToleranceThreshold(value)}
              min={0}
              max={10}
              step={0.5}
              className="flex-1"
            />
            <span className="text-xs font-medium w-10 text-center">{toleranceThreshold.toFixed(1)}px</span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded border border-red-700"></div>
              <span className="font-medium">{highSeverityCount}</span>
              <span className="text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-orange-500 rounded border border-orange-700"></div>
              <span className="font-medium">{mediumSeverityCount}</span>
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded border border-yellow-700"></div>
              <span className="font-medium">{lowSeverityCount}</span>
              <span className="text-muted-foreground">Minor</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-muted/30">
          <div className="flex gap-6">
            <div 
              className="bg-white shadow-lg flex-shrink-0" 
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
                {pdfTextPositions.map((pos) => (
                  <g key={pos.id}>
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.width}
                      height={pos.height}
                      fill="rgba(0, 100, 255, 0.08)"
                      stroke="rgb(0, 100, 255)"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + pos.fontSize * 0.75}
                      fontSize={pos.fontSize}
                      fill="rgba(0, 100, 255, 0.5)"
                      fontFamily="Arial"
                    >
                      {pos.text}
                    </text>
                  </g>
                ))}
                
                {extractedElements.map((pos) => (
                  <g key={pos.id}>
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={pos.width}
                      height={pos.height}
                      fill="rgba(255, 0, 0, 0.08)"
                      stroke="rgb(255, 0, 0)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + pos.fontSize * 0.75}
                      fontSize={pos.fontSize}
                      fill="rgba(255, 0, 0, 0.6)"
                      fontFamily="Arial"
                      fontWeight="500"
                    >
                      {pos.text}
                    </text>
                  </g>
                ))}

                {showDiffOverlay && filteredMismatches.map((mismatch, idx) => {
                  const colors = getSeverityColor(mismatch.severity)
                  const pdfPos = mismatch.pdfText
                  const extPos = mismatch.extractedText

                  return (
                    <g 
                      key={`mismatch-${idx}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedMismatch(mismatch)}
                    >
                      <rect
                        x={pdfPos.x - 2}
                        y={pdfPos.y - 2}
                        width={pdfPos.width + 4}
                        height={pdfPos.height + 4}
                        fill={colors.fill}
                        stroke={colors.stroke}
                        strokeWidth="2"
                        rx="2"
                      />
                      
                      {extPos && (
                        <>
                          <line
                            x1={pdfPos.x + pdfPos.width / 2}
                            y1={pdfPos.y + pdfPos.height / 2}
                            x2={extPos.x + extPos.width / 2}
                            y2={extPos.y + extPos.height / 2}
                            stroke={colors.stroke}
                            strokeWidth="1.5"
                            strokeDasharray="4,2"
                            markerEnd="url(#arrowhead)"
                          />
                          
                          <circle
                            cx={pdfPos.x + pdfPos.width / 2}
                            cy={pdfPos.y + pdfPos.height / 2}
                            r="3"
                            fill={colors.stroke}
                          />
                          
                          <circle
                            cx={extPos.x + extPos.width / 2}
                            cy={extPos.y + extPos.height / 2}
                            r="3"
                            fill={colors.stroke}
                          />
                        </>
                      )}
                      
                      <text
                        x={pdfPos.x + pdfPos.width + 5}
                        y={pdfPos.y + 8}
                        fontSize="8"
                        fill={colors.stroke}
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {extPos ? `Δ${mismatch.totalOffset.toFixed(1)}px` : 'MISSING'}
                      </text>
                    </g>
                  )
                })}

                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="rgb(255, 140, 0)" />
                  </marker>
                </defs>
              </svg>
            </div>

            {selectedMismatch && (
              <div className="w-80 flex-shrink-0">
                <div className="bg-card border rounded-lg p-4 sticky top-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Mismatch Details</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMismatch(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Text Content</Label>
                      <div className="bg-muted/50 p-2 rounded mt-1 font-mono text-sm break-words">
                        "{selectedMismatch.pdfText.text}"
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Severity</Label>
                      <div className="mt-1">
                        <Badge 
                          variant={selectedMismatch.severity === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {selectedMismatch.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {selectedMismatch.extractedText && (
                      <>
                        <Separator />

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <Label className="text-muted-foreground">X Offset</Label>
                            <div className="font-mono font-semibold text-orange-600 mt-1">
                              {selectedMismatch.xOffset.toFixed(2)}px
                            </div>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Y Offset</Label>
                            <div className="font-mono font-semibold text-orange-600 mt-1">
                              {selectedMismatch.yOffset.toFixed(2)}px
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Total Offset</Label>
                          <div className="font-mono font-bold text-red-600 text-lg mt-1">
                            {selectedMismatch.totalOffset.toFixed(2)}px
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-blue-600 font-semibold">PDF Position</Label>
                            <div className="bg-blue-50/50 p-2 rounded mt-1 font-mono text-xs space-y-1">
                              <div>x: {selectedMismatch.pdfText.x.toFixed(1)}</div>
                              <div>y: {selectedMismatch.pdfText.y.toFixed(1)}</div>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-red-600 font-semibold">Extracted Position</Label>
                            <div className="bg-red-50/50 p-2 rounded mt-1 font-mono text-xs space-y-1">
                              <div>x: {selectedMismatch.extractedText.x.toFixed(1)}</div>
                              <div>y: {selectedMismatch.extractedText.y.toFixed(1)}</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {!selectedMismatch.extractedText && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertDescription className="text-xs text-red-700">
                          <strong>Missing extracted text:</strong> This element exists in the PDF but has no corresponding extracted overlay.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-card/50">
          <div className="max-w-6xl mx-auto">
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Visual Diff Legend:</strong> Red/Orange/Yellow overlays highlight misaligned text. 
                Connecting lines show the offset between PDF (blue) and extracted (red) text positions. 
                Click any highlighted element for detailed mismatch information.
                {alignmentUpdates.length > 0 && (
                  <span className="block mt-2 font-medium">
                    Use <strong>Align All & Save</strong> to move all misaligned extracted text to match PDF positions and save to the canvas for editing.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}
