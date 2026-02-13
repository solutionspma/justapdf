import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Download, Spinner, Stamp, Drop, Lock, FilePdf } from '@phosphor-icons/react'
import type { PDFDocument, WatermarkSettings, StampSettings, ExportSettings } from '@/lib/types'
import { exportPDF, exportSinglePage, exportSelectedPages, downloadBlob } from '@/lib/pdfExport'
import { toast } from 'sonner'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: PDFDocument
  currentPageIndex?: number
}

export function ExportDialog({ open, onOpenChange, document, currentPageIndex = 0 }: ExportDialogProps) {
  const [filename, setFilename] = useState(
    document.name.replace('.pdf', '-edited.pdf')
  )
  const [quality, setQuality] = useState<'standard' | 'high'>('standard')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  
  const [exportMode, setExportMode] = useState<'all' | 'current' | 'range'>('all')
  const [pageRange, setPageRange] = useState('')
  
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [watermarkFontSize, setWatermarkFontSize] = useState(48)
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3)
  const [watermarkRotation, setWatermarkRotation] = useState(0)
  const [watermarkColor, setWatermarkColor] = useState('#000000')
  const [watermarkPosition, setWatermarkPosition] = useState<'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('diagonal')
  
  const [stampEnabled, setStampEnabled] = useState(false)
  const [stampType, setStampType] = useState<'approved' | 'confidential' | 'draft' | 'final' | 'copy' | 'custom'>('approved')
  const [stampCustomText, setStampCustomText] = useState('')
  const [stampColor, setStampColor] = useState('#FF0000')
  const [stampPosition, setStampPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-right')
  const [stampPages, setStampPages] = useState<'all' | 'first' | 'last'>('all')

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const watermark: WatermarkSettings = {
        enabled: watermarkEnabled,
        text: watermarkText,
        fontSize: watermarkFontSize,
        opacity: watermarkOpacity,
        rotation: watermarkRotation,
        color: watermarkColor,
        position: watermarkPosition
      }
      
      const stamp: StampSettings = {
        enabled: stampEnabled,
        type: stampType,
        customText: stampCustomText,
        color: stampColor,
        position: stampPosition,
        pages: stampPages
      }
      
      const settings: ExportSettings = {
        watermark,
        stamp,
        quality,
        includeMetadata
      }
      
      let blob: Blob
      
      if (exportMode === 'current') {
        blob = await exportSinglePage(document, currentPageIndex, settings)
      } else if (exportMode === 'range' && pageRange) {
        const indices = parsePageRange(pageRange, document.pages.length)
        if (indices.length === 0) {
          toast.error('Invalid page range')
          return
        }
        blob = await exportSelectedPages(document, indices, settings)
      } else {
        blob = await exportPDF(document, settings)
      }
      
      downloadBlob(blob, filename)
      toast.success('PDF exported successfully!')
      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }
  
  const parsePageRange = (range: string, totalPages: number): number[] => {
    const indices: number[] = []
    const parts = range.split(',').map(s => s.trim())
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()))
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
          for (let i = start; i <= end; i++) {
            indices.push(i - 1)
          }
        }
      } else {
        const page = parseInt(part)
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          indices.push(page - 1)
        }
      }
    }
    
    return [...new Set(indices)].sort((a, b) => a - b)
  }

  const estimatedSize = () => {
    const baseSize = document.pages.length * 50
    const elementCount = document.pages.reduce(
      (sum, page) => sum + page.elements.length,
      0
    )
    const imageCount = document.pages.reduce(
      (sum, page) =>
        sum + page.elements.filter((el) => el.type === 'image' || el.type === 'signature').length,
      0
    )

    const sizeKB = baseSize + elementCount * 10 + imageCount * 100
    return sizeKB > 1024 ? `~${(sizeKB / 1024).toFixed(1)} MB` : `~${sizeKB} KB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePdf size={24} weight="duotone" />
            Export PDF
          </DialogTitle>
          <DialogDescription>
            Configure your export settings and download the edited PDF.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="watermark">
              <Drop size={16} className="mr-1" />
              Watermark
            </TabsTrigger>
            <TabsTrigger value="stamp">
              <Stamp size={16} className="mr-1" />
              Stamp
            </TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="my-document.pdf"
              />
            </div>

            <div className="space-y-3">
              <Label>Quality</Label>
              <RadioGroup value={quality} onValueChange={(val) => setQuality(val as 'standard' | 'high')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="font-normal cursor-pointer">
                    Standard (smaller file size)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal cursor-pointer">
                    High Quality (larger file size)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              />
              <Label htmlFor="metadata" className="font-normal cursor-pointer">
                Include document metadata
              </Label>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pages</span>
                <span className="font-medium">{document.pages.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Elements</span>
                <span className="font-medium">
                  {document.pages.reduce((sum, page) => sum + page.elements.length, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated size</span>
                <span className="font-medium">{estimatedSize()}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="watermark" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="watermark-enabled"
                checked={watermarkEnabled}
                onCheckedChange={(checked) => setWatermarkEnabled(checked as boolean)}
              />
              <Label htmlFor="watermark-enabled" className="font-normal cursor-pointer">
                Add watermark to PDF
              </Label>
            </div>
            
            {watermarkEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="watermark-text">Watermark Text</Label>
                  <Input
                    id="watermark-text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="CONFIDENTIAL"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="watermark-position">Position</Label>
                  <Select value={watermarkPosition} onValueChange={(val) => setWatermarkPosition(val as any)}>
                    <SelectTrigger id="watermark-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="diagonal">Diagonal</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="watermark-font-size">Font Size: {watermarkFontSize}px</Label>
                  <Slider
                    id="watermark-font-size"
                    min={20}
                    max={100}
                    step={1}
                    value={[watermarkFontSize]}
                    onValueChange={(val) => setWatermarkFontSize(val[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="watermark-opacity">Opacity: {(watermarkOpacity * 100).toFixed(0)}%</Label>
                  <Slider
                    id="watermark-opacity"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={[watermarkOpacity]}
                    onValueChange={(val) => setWatermarkOpacity(val[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="watermark-rotation">Rotation: {watermarkRotation}°</Label>
                  <Slider
                    id="watermark-rotation"
                    min={-90}
                    max={90}
                    step={5}
                    value={[watermarkRotation]}
                    onValueChange={(val) => setWatermarkRotation(val[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="watermark-color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="watermark-color"
                      type="color"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="stamp" className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stamp-enabled"
                checked={stampEnabled}
                onCheckedChange={(checked) => setStampEnabled(checked as boolean)}
              />
              <Label htmlFor="stamp-enabled" className="font-normal cursor-pointer">
                Add stamp to PDF
              </Label>
            </div>
            
            {stampEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="stamp-type">Stamp Type</Label>
                  <Select value={stampType} onValueChange={(val) => setStampType(val as any)}>
                    <SelectTrigger id="stamp-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">APPROVED</SelectItem>
                      <SelectItem value="confidential">CONFIDENTIAL</SelectItem>
                      <SelectItem value="draft">DRAFT</SelectItem>
                      <SelectItem value="final">FINAL</SelectItem>
                      <SelectItem value="copy">COPY</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {stampType === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="stamp-custom-text">Custom Stamp Text</Label>
                    <Input
                      id="stamp-custom-text"
                      value={stampCustomText}
                      onChange={(e) => setStampCustomText(e.target.value)}
                      placeholder="CUSTOM STAMP"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="stamp-position">Position</Label>
                  <Select value={stampPosition} onValueChange={(val) => setStampPosition(val as any)}>
                    <SelectTrigger id="stamp-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stamp-pages">Apply to Pages</Label>
                  <Select value={stampPages} onValueChange={(val) => setStampPages(val as any)}>
                    <SelectTrigger id="stamp-pages">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      <SelectItem value="first">First Page Only</SelectItem>
                      <SelectItem value="last">Last Page Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stamp-color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="stamp-color"
                      type="color"
                      value={stampColor}
                      onChange={(e) => setStampColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={stampColor}
                      onChange={(e) => setStampColor(e.target.value)}
                      placeholder="#FF0000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="pages" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label>Export Pages</Label>
              <RadioGroup value={exportMode} onValueChange={(val) => setExportMode(val as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="export-all" />
                  <Label htmlFor="export-all" className="font-normal cursor-pointer">
                    All pages ({document.pages.length} pages)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="export-current" />
                  <Label htmlFor="export-current" className="font-normal cursor-pointer">
                    Current page only (page {currentPageIndex + 1})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range" id="export-range" />
                  <Label htmlFor="export-range" className="font-normal cursor-pointer">
                    Page range
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {exportMode === 'range' && (
              <div className="space-y-2">
                <Label htmlFor="page-range">Page Range</Label>
                <Input
                  id="page-range"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-9"
                />
                <p className="text-xs text-muted-foreground">
                  Enter page numbers separated by commas. Use hyphens for ranges (e.g., 1-3, 5, 7-9)
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <Spinner className="animate-spin" size={16} />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} weight="bold" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
