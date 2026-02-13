import { useCallback, useState } from 'react'
import { Upload, FileText, Flask } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

interface UploadZoneProps {
  onFileUpload: (file: File) => void
}

export function UploadZone({ onFileUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const createTestPDF = async () => {
    setIsCreating(true)
    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([612, 792])
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
      
      page.drawText('OCR Test Document', {
        x: 50,
        y: 742,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Comprehensive OCR Testing & Text Detection', {
        x: 50,
        y: 710,
        size: 12,
        font: italicFont,
        color: rgb(0.3, 0.3, 0.3),
      })
      
      page.drawText('Contact Information:', {
        x: 50,
        y: 670,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Email: test@example.com', {
        x: 70,
        y: 650,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Phone: (555) 123-4567', {
        x: 70,
        y: 635,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Website: https://example.com', {
        x: 70,
        y: 620,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Sample Paragraph:', {
        x: 50,
        y: 585,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('This is a comprehensive test document designed to evaluate OCR', {
        x: 70,
        y: 565,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('text detection capabilities. It contains various text elements', {
        x: 70,
        y: 552,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('including headers, paragraphs, lists, and formatted content.', {
        x: 70,
        y: 539,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Numbered List:', {
        x: 50,
        y: 510,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('1. First item in the list', {
        x: 70,
        y: 490,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('2. Second item for testing', {
        x: 70,
        y: 477,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('3. Third item with more text', {
        x: 70,
        y: 464,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('4. Fourth item to complete the list', {
        x: 70,
        y: 451,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Important Dates:', {
        x: 50,
        y: 422,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('January 15, 2024 - Project Start', {
        x: 70,
        y: 402,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('March 30, 2024 - Mid-point Review', {
        x: 70,
        y: 389,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('June 20, 2024 - Final Deadline', {
        x: 70,
        y: 376,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Financial Data:', {
        x: 50,
        y: 347,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Total Budget: $125,000.00', {
        x: 70,
        y: 327,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Expenses: $87,543.21', {
        x: 70,
        y: 314,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Remaining: $37,456.79', {
        x: 70,
        y: 301,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Technical Specifications:', {
        x: 50,
        y: 272,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Resolution: 1920x1080 pixels', {
        x: 70,
        y: 252,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Frame Rate: 60 FPS', {
        x: 70,
        y: 239,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Color Depth: 24-bit RGB', {
        x: 70,
        y: 226,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Notes & Observations:', {
        x: 50,
        y: 197,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('The quick brown fox jumps over the lazy dog.', {
        x: 70,
        y: 177,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('UPPERCASE TEXT FOR TESTING', {
        x: 70,
        y: 164,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('lowercase text for testing', {
        x: 70,
        y: 151,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('MixedCase123WithNumbers456', {
        x: 70,
        y: 138,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Special Characters: !@#$%^&*()_+-=[]{}|;:",.<>?', {
        x: 70,
        y: 125,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Rotated Text Tests:', {
        x: 350,
        y: 520,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
      
      page.drawText('Rotated 45° - Diagonal text for angle detection', {
        x: 380,
        y: 480,
        size: 9,
        font: font,
        color: rgb(0.2, 0.2, 0.8),
        rotate: degrees(45),
      })
      
      page.drawText('Rotated 90° - Vertical text', {
        x: 500,
        y: 400,
        size: 9,
        font: font,
        color: rgb(0.8, 0.2, 0.2),
        rotate: degrees(90),
      })
      
      page.drawText('Rotated 135° - Steep diagonal', {
        x: 450,
        y: 350,
        size: 9,
        font: font,
        color: rgb(0.2, 0.8, 0.2),
        rotate: degrees(135),
      })
      
      page.drawText('Rotated 180° - Upside down text', {
        x: 480,
        y: 280,
        size: 9,
        font: font,
        color: rgb(0.8, 0.5, 0.2),
        rotate: degrees(180),
      })
      
      page.drawText('Rotated 270° - Vertical (other way)', {
        x: 380,
        y: 250,
        size: 9,
        font: font,
        color: rgb(0.5, 0.2, 0.8),
        rotate: degrees(270),
      })
      
      page.drawText('Rotated -45° - Negative angle', {
        x: 420,
        y: 180,
        size: 9,
        font: font,
        color: rgb(0.2, 0.6, 0.8),
        rotate: degrees(-45),
      })
      
      page.drawText('Rotated 30° - Shallow angle', {
        x: 400,
        y: 120,
        size: 9,
        font: font,
        color: rgb(0.8, 0.2, 0.6),
        rotate: degrees(30),
      })
      
      page.drawText('Footer: Page 1 of 1', {
        x: 50,
        y: 50,
        size: 9,
        font: italicFont,
        color: rgb(0.5, 0.5, 0.5),
      })
      
      page.drawText('Generated by PDFlex OCR Test Suite', {
        x: 400,
        y: 50,
        size: 9,
        font: italicFont,
        color: rgb(0.5, 0.5, 0.5),
      })
      
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const file = new File([blob], 'test-ocr-document.pdf', { type: 'application/pdf' })
      
      onFileUpload(file)
    } catch (error) {
      console.error('Failed to create test PDF:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      onFileUpload(pdfFile)
    }
  }, [onFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      onFileUpload(file)
    }
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-muted/20 to-accent/5">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <FileText size={40} weight="duotone" className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-foreground">
            PDFlex
          </h1>
          <p className="text-lg text-muted-foreground">
            Professional PDF editing in your browser
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200",
            isDragging
              ? "border-accent bg-accent/10 scale-105"
              : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
          )}
        >
          <input
            type="file"
            id="file-upload"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center text-center">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors",
              isDragging ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Upload size={32} weight="bold" />
            </div>
            
            <p className="text-xl font-semibold mb-2 text-foreground">
              {isDragging ? "Drop your PDF here" : "Upload PDF to start editing"}
            </p>
            
            <p className="text-sm text-muted-foreground mb-8">
              Drag and drop your PDF file or click the button below
            </p>
            
            <div className="flex gap-3">
              <Button
                asChild
                size="lg"
                className="font-medium"
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText size={20} weight="bold" className="mr-2" />
                  Choose PDF File
                </label>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={createTestPDF}
                disabled={isCreating}
                className="font-medium"
              >
                <Flask size={20} weight="bold" className="mr-2" />
                {isCreating ? 'Creating...' : 'Create Test PDF'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="font-semibold text-foreground mb-1">Edit Text</p>
            <p className="text-xs text-muted-foreground">Modify content</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="font-semibold text-foreground mb-1">Add Images</p>
            <p className="text-xs text-muted-foreground">Insert graphics</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="font-semibold text-foreground mb-1">Sign PDFs</p>
            <p className="text-xs text-muted-foreground">Digital signatures</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="font-semibold text-foreground mb-1">OCR Text</p>
            <p className="text-xs text-muted-foreground">Detect & extract</p>
          </div>
        </div>
        
        <div className="mt-8 p-4 rounded-lg bg-accent/10 border border-accent/30">
          <p className="text-sm text-foreground">
            <span className="font-semibold">💡 Testing OCR?</span> Click "Create Test PDF" to generate a simple document with readable text for OCR detection testing.
          </p>
        </div>
      </div>
    </div>
  )
}
