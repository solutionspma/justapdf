import { useState } from 'react'
import { X, GridFour, Ruler as RulerIcon, Target, Eye, EyeClosed } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { PDFElement } from '@/lib/types'

interface AlignmentGuideOverlayProps {
  elements: PDFElement[]
  pageWidth: number
  pageHeight: number
  zoom: number
  onClose: () => void
}

export function AlignmentGuideOverlay({
  elements,
  pageWidth,
  pageHeight,
  zoom,
  onClose
}: AlignmentGuideOverlayProps) {
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [showCrosshairs, setShowCrosshairs] = useState(true)
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true)
  const [showBaselines, setShowBaselines] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [guideOpacity, setGuideOpacity] = useState(0.6)

  const textElements = elements.filter(el => el.type === 'text')

  return (
    <div className="fixed inset-0 z-50 flex">
      <div 
        className="absolute inset-0 bg-background/95 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-80 bg-card border-r shadow-2xl flex flex-col z-10">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Alignment Guides</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Visualize text positioning
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <GridFour className="w-4 h-4" />
              Grid & Guides
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
                <Switch
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>

              {showGrid && (
                <div className="pl-4 space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Grid Size: {gridSize}px
                  </Label>
                  <Slider
                    value={[gridSize]}
                    onValueChange={(v) => setGridSize(v[0])}
                    min={10}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="show-rulers" className="text-sm">Show Rulers</Label>
                <Switch
                  id="show-rulers"
                  checked={showRulers}
                  onCheckedChange={setShowRulers}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-crosshairs" className="text-sm">Show Crosshairs</Label>
                <Switch
                  id="show-crosshairs"
                  checked={showCrosshairs}
                  onCheckedChange={setShowCrosshairs}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" />
              Text Visualization
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-boxes" className="text-sm">Bounding Boxes</Label>
                <Switch
                  id="show-boxes"
                  checked={showBoundingBoxes}
                  onCheckedChange={setShowBoundingBoxes}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-baselines" className="text-sm">Text Baselines</Label>
                <Switch
                  id="show-baselines"
                  checked={showBaselines}
                  onCheckedChange={setShowBaselines}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Guide Opacity: {Math.round(guideOpacity * 100)}%
                </Label>
                <Slider
                  value={[guideOpacity]}
                  onValueChange={(v) => setGuideOpacity(v[0])}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-sm font-semibold">Element Statistics</h3>
            <div className="text-xs space-y-1 font-mono bg-muted p-3 rounded-md">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Elements:</span>
                <span className="font-semibold">{elements.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Text Elements:</span>
                <span className="font-semibold">{textElements.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page Size:</span>
                <span className="font-semibold">{pageWidth} × {pageHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Zoom:</span>
                <span className="font-semibold">{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-sm font-semibold">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 bg-blue-500/10" />
                <span>Bounding Box</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500" />
                <span>Baseline (text bottom)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500 border-t-2 border-green-500" />
                <span>Top Edge</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-dashed border-muted-foreground" />
                <span>Grid Lines</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full">
            Close Alignment Guides
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="min-h-full flex items-center justify-center p-8">
          <div 
            className="relative bg-white shadow-2xl"
            style={{ 
              width: pageWidth * zoom,
              height: pageHeight * zoom,
            }}
          >
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ opacity: guideOpacity }}
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="grid"
                  width={gridSize * zoom}
                  height={gridSize * zoom}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-muted-foreground/30"
                  />
                </pattern>
              </defs>

              {showGrid && (
                <rect width="100%" height="100%" fill="url(#grid)" />
              )}

              {showRulers && (
                <>
                  <g className="text-muted-foreground">
                    {Array.from({ length: Math.ceil(pageWidth / 50) }).map((_, i) => {
                      const x = i * 50 * zoom
                      return (
                        <g key={`ruler-x-${i}`}>
                          <line
                            x1={x}
                            y1={0}
                            x2={x}
                            y2={10}
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                          <text
                            x={x + 2}
                            y={20}
                            fontSize="10"
                            fill="currentColor"
                          >
                            {i * 50}
                          </text>
                        </g>
                      )
                    })}
                  </g>
                  
                  <g className="text-muted-foreground">
                    {Array.from({ length: Math.ceil(pageHeight / 50) }).map((_, i) => {
                      const y = i * 50 * zoom
                      return (
                        <g key={`ruler-y-${i}`}>
                          <line
                            x1={0}
                            y1={y}
                            x2={10}
                            y2={y}
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                          <text
                            x={12}
                            y={y + 4}
                            fontSize="10"
                            fill="currentColor"
                          >
                            {i * 50}
                          </text>
                        </g>
                      )
                    })}
                  </g>
                </>
              )}

              {textElements.map((element, i) => {
                const x = element.x * zoom
                const y = element.y * zoom
                const width = element.width * zoom
                const height = element.height * zoom
                const fontSize = (element.data.fontSize || 12) * zoom

                return (
                  <g key={element.id}>
                    {showBoundingBoxes && (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                    )}

                    {showBaselines && (
                      <>
                        <line
                          x1={x}
                          y1={y + height}
                          x2={x + width}
                          y2={y + height}
                          stroke="rgb(239, 68, 68)"
                          strokeWidth="1.5"
                        />
                        
                        <line
                          x1={x}
                          y1={y}
                          x2={x + width}
                          y2={y}
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="1"
                        />
                      </>
                    )}

                    {showCrosshairs && (
                      <>
                        <circle
                          cx={x}
                          cy={y}
                          r="3"
                          fill="rgb(59, 130, 246)"
                        />
                        
                        <circle
                          cx={x + width}
                          cy={y + height}
                          r="3"
                          fill="rgb(239, 68, 68)"
                        />
                      </>
                    )}

                    <text
                      x={x}
                      y={y - 4}
                      fontSize="9"
                      fill="rgb(59, 130, 246)"
                      fontFamily="monospace"
                      className="select-none"
                    >
                      x:{element.x.toFixed(0)} y:{element.y.toFixed(0)}
                    </text>

                    {element.data.isExtracted && (
                      <text
                        x={x + width + 4}
                        y={y + height / 2}
                        fontSize="9"
                        fill="rgb(168, 85, 247)"
                        fontFamily="monospace"
                        className="select-none"
                      >
                        [Extracted]
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            {textElements.map((element) => (
              <div
                key={element.id}
                className="absolute pointer-events-none"
                style={{
                  left: element.x * zoom,
                  top: element.y * zoom,
                  width: element.width * zoom,
                  height: element.height * zoom,
                  fontSize: (element.data.fontSize || 12) * zoom,
                  fontFamily: element.data.fontFamily || 'Arial',
                  fontWeight: element.data.fontWeight,
                  fontStyle: element.data.fontStyle,
                  color: element.data.color || '#000000',
                }}
              >
                {element.data.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
