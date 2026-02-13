import { useState } from 'react'
import { 
  CursorClick, 
  TextAa, 
  Image, 
  CheckSquare, 
  Signature,
  Eye,
  ArrowCounterClockwise,
  ArrowClockwise,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Download,
  MagnifyingGlass,
  ShieldCheck,
  Highlighter,
  Note,
  ArrowRight,
  Circle,
  Stamp,
  FilePlus,
  Flask,
  ArrowsOutLineVertical,
  GridFour,
  TextColumns,
  Palette,
  Wrench,
  CaretDown,
  Certificate,
  Warning
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { EditMode, PDFDocument } from '@/lib/types'
import type { GridSettings } from '@/lib/snapToGrid'
import { ExportDialog } from '@/components/ExportDialog'
import { CertificateDialog } from '@/components/CertificateDialog'

interface ToolbarProps {
  editMode: EditMode
  onEditModeChange: (mode: EditMode) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  currentDoc: PDFDocument | undefined
  currentPageIndex?: number
  onUndo: () => void
  onRedo: () => void
  onOCR?: () => void
  isOCRProcessing?: boolean
  onOpenSearch: () => void
  onOpenSignatureVerification: () => void
  onOpenPageTemplates: () => void
  onGenerateTestPDF?: () => void
  onShowAlignmentComparison?: () => void
  onShowAlignmentDiff?: () => void
  onOpenBaselineOffset?: () => void
  onShowAlignmentGuides?: () => void
  onCalibrateLetterSpacing?: () => void
  gridSettings: GridSettings
  onOpenGridSettings: () => void
  onOpenColorPalettes?: () => void
  useExtractedTextMode?: boolean
  onToggleExtractedTextMode?: () => void
  onMergeTextElements?: () => void
}

export function Toolbar({
  editMode,
  onEditModeChange,
  zoom,
  onZoomChange,
  currentDoc,
  currentPageIndex = 0,
  onUndo,
  onRedo,
  onOCR,
  isOCRProcessing = false,
  onOpenSearch,
  onOpenSignatureVerification,
  onOpenPageTemplates,
  onGenerateTestPDF,
  onShowAlignmentComparison,
  onShowAlignmentDiff,
  onOpenBaselineOffset,
  onShowAlignmentGuides,
  onCalibrateLetterSpacing,
  gridSettings,
  onOpenGridSettings,
  onOpenColorPalettes,
  useExtractedTextMode = false,
  onToggleExtractedTextMode,
  onMergeTextElements
}: ToolbarProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const tools: { mode: EditMode; icon: any; label: string; color: string }[] = [
    { mode: 'select', icon: CursorClick, label: 'Select', color: 'hover:bg-primary/20 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground' },
    { mode: 'text', icon: TextAa, label: 'Text', color: 'hover:bg-mode-text/20 data-[active=true]:bg-mode-text data-[active=true]:text-white' },
    { mode: 'image', icon: Image, label: 'Image', color: 'hover:bg-mode-image/20 data-[active=true]:bg-mode-image data-[active=true]:text-white' },
    { mode: 'form', icon: CheckSquare, label: 'Form', color: 'hover:bg-mode-form/20 data-[active=true]:bg-mode-form data-[active=true]:text-white' },
    { mode: 'signature', icon: Signature, label: 'Signature', color: 'hover:bg-mode-signature/20 data-[active=true]:bg-mode-signature data-[active=true]:text-white' },
    { mode: 'highlight', icon: Highlighter, label: 'Highlight', color: 'hover:bg-yellow-500/20 data-[active=true]:bg-yellow-500 data-[active=true]:text-white' },
    { mode: 'note', icon: Note, label: 'Sticky Note', color: 'hover:bg-orange-500/20 data-[active=true]:bg-orange-500 data-[active=true]:text-white' },
    { mode: 'arrow', icon: ArrowRight, label: 'Arrow', color: 'hover:bg-blue-500/20 data-[active=true]:bg-blue-500 data-[active=true]:text-white' },
    { mode: 'shape', icon: Circle, label: 'Shapes', color: 'hover:bg-green-500/20 data-[active=true]:bg-green-500 data-[active=true]:text-white' },
    { mode: 'stamp', icon: Stamp, label: 'Stamps', color: 'hover:bg-red-500/20 data-[active=true]:bg-red-500 data-[active=true]:text-white' },
  ]

  return (
    <>
      <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Button
                  key={tool.mode}
                  variant="ghost"
                  size="sm"
                  data-active={editMode === tool.mode}
                  onClick={() => onEditModeChange(tool.mode)}
                  className={cn(
                    "transition-all duration-150",
                    tool.color
                  )}
                  title={tool.label}
                >
                  <Icon size={20} weight="bold" />
                </Button>
              )
            })}
          </div>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
          >
            <ArrowCounterClockwise size={20} weight="bold" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
          >
            <ArrowClockwise size={20} weight="bold" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
            title="Zoom Out"
          >
            <MagnifyingGlassMinus size={20} weight="bold" />
          </Button>
          <span className="font-mono text-sm text-muted-foreground min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onZoomChange(Math.min(3, zoom + 0.25))}
            title="Zoom In"
          >
            <MagnifyingGlassPlus size={20} weight="bold" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={gridSettings.showGrid ? 'default' : 'outline'}
                  size="sm"
                  onClick={onOpenGridSettings}
                  className="h-8 w-8 p-0"
                  title="Grid Settings (G)"
                >
                  <GridFour size={16} weight={gridSettings.enabled ? 'fill' : 'bold'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">Snap-to-Grid Settings</p>
                <p className="text-xs text-muted-foreground mt-1">Grid: {gridSettings.showGrid ? 'Visible' : 'Hidden'}</p>
                <p className="text-xs text-muted-foreground">Snap: {gridSettings.enabled ? 'Enabled' : 'Disabled'}</p>
                <p className="text-xs text-muted-foreground">Size: {gridSettings.size}px</p>
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Press G to toggle grid</p>
                  <p className="text-xs text-muted-foreground">Press Shift+G to toggle snap</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {useExtractedTextMode && (
            <div className="mr-2 px-3 py-1.5 rounded-md bg-accent/20 border border-accent flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-accent-foreground">Extracted Text Mode</span>
            </div>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenSearch}
                  className="h-8 w-8 p-0"
                >
                  <MagnifyingGlass size={16} weight="bold" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Find & Replace</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={useExtractedTextMode ? "default" : "outline"}
                      size="sm"
                      className="h-8 gap-1 px-2 relative"
                    >
                      {useExtractedTextMode && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-background"></div>
                      )}
                      <Eye size={16} weight={useExtractedTextMode ? "fill" : "bold"} />
                      <span className="text-xs">Text</span>
                      <CaretDown size={12} weight="bold" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Text Extraction & Alignment{useExtractedTextMode ? ' (Active)' : ''}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Text Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onOCR && (
                <DropdownMenuItem onClick={onOCR} disabled={isOCRProcessing}>
                  <Eye size={16} weight="bold" className="mr-2" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Extract Text</span>
                    <span className="text-xs text-muted-foreground">Read embedded text from PDF</span>
                  </div>
                </DropdownMenuItem>
              )}
              {onShowAlignmentComparison && (
                <DropdownMenuItem onClick={onShowAlignmentComparison}>
                  <Eye size={16} weight="duotone" className="mr-2" />
                  <div className="flex flex-col">
                    <span>Compare Alignment</span>
                    <span className="text-xs text-muted-foreground">Overlay extracted text with PDF</span>
                  </div>
                </DropdownMenuItem>
              )}
              {onShowAlignmentDiff && (
                <DropdownMenuItem onClick={onShowAlignmentDiff}>
                  <Warning size={16} weight="fill" className="mr-2 text-orange-500" />
                  <div className="flex flex-col">
                    <span>Visual Diff Analyzer</span>
                    <span className="text-xs text-muted-foreground">Highlight misaligned text</span>
                  </div>
                </DropdownMenuItem>
              )}
              {onOpenBaselineOffset && (
                <DropdownMenuItem onClick={onOpenBaselineOffset}>
                  <ArrowsOutLineVertical size={16} weight="bold" className="mr-2" />
                  <div className="flex flex-col">
                    <span>Baseline Offset</span>
                    <span className="text-xs text-muted-foreground">Fine-tune vertical alignment</span>
                  </div>
                </DropdownMenuItem>
              )}
              {onShowAlignmentGuides && (
                <DropdownMenuItem onClick={onShowAlignmentGuides}>
                  <GridFour size={16} weight="bold" className="mr-2" />
                  <div className="flex flex-col">
                    <span>Alignment Guides</span>
                    <span className="text-xs text-muted-foreground">Show positioning guides</span>
                  </div>
                </DropdownMenuItem>
              )}
              {onCalibrateLetterSpacing && (
                <DropdownMenuItem onClick={onCalibrateLetterSpacing}>
                  <TextColumns size={16} weight="bold" className="mr-2" />
                  <div className="flex flex-col">
                    <span>Calibrate Letter Spacing</span>
                    <span className="text-xs text-muted-foreground">Auto-adjust character spacing</span>
                  </div>
                </DropdownMenuItem>
              )}
              {onMergeTextElements && (
                <DropdownMenuItem onClick={onMergeTextElements}>
                  <TextAa size={16} weight="duotone" className="mr-2" />
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold">Merge Text Elements</span>
                    <span className="text-xs text-muted-foreground">Combine text into editable blocks</span>
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onToggleExtractedTextMode && (
                <DropdownMenuItem onClick={onToggleExtractedTextMode}>
                  <Eye size={16} weight={useExtractedTextMode ? "fill" : "bold"} className="mr-2" />
                  <div className="flex flex-col">
                    <span className="font-semibold">{useExtractedTextMode ? '✓ ' : ''}Use Extracted Text</span>
                    <span className="text-xs text-muted-foreground">
                      {useExtractedTextMode ? 'PDF text hidden, using extracted' : 'Show both PDF and extracted text'}
                    </span>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 px-2"
                    >
                      <Wrench size={16} weight="bold" />
                      <span className="text-xs">Tools</span>
                      <CaretDown size={12} weight="bold" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Additional Tools & Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Document Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenPageTemplates}>
                <FilePlus size={16} weight="bold" className="mr-2" />
                <span>Page Templates</span>
              </DropdownMenuItem>
              {onOpenColorPalettes && (
                <DropdownMenuItem onClick={onOpenColorPalettes}>
                  <Palette size={16} weight="duotone" className="mr-2" />
                  <span>Color Palettes</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Security & Verification</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenSignatureVerification}>
                <ShieldCheck size={16} weight="bold" className="mr-2" />
                <span>Verify Signatures</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <CertificateDialog 
                  trigger={
                    <button className="flex items-center w-full text-left">
                      <Certificate size={16} weight="bold" className="mr-2" />
                      <span>Manage Certificates</span>
                    </button>
                  }
                />
              </DropdownMenuItem>
              {onGenerateTestPDF && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Development</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onGenerateTestPDF}>
                    <Flask size={16} weight="bold" className="mr-2" />
                    <span>Generate Test PDF</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            onClick={() => setExportDialogOpen(true)}
            size="sm"
            className="h-8 gap-2 px-3"
          >
            <Download size={16} weight="bold" />
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </header>

      {currentDoc && (
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          document={currentDoc}
          currentPageIndex={currentPageIndex}
        />
      )}
    </>
  )
}
