import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import type { PDFDocument, PDFElement } from '@/lib/types'

interface BaselineOffsetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: PDFDocument
  currentPageIndex: number
  onApplyOffset: (offset: number, applyToAll: boolean) => void
}

export function BaselineOffsetDialog({
  open,
  onOpenChange,
  document,
  currentPageIndex,
  onApplyOffset,
}: BaselineOffsetDialogProps) {
  const [offset, setOffset] = useState(0)
  const [applyToAll, setApplyToAll] = useState(false)

  const currentPage = document.pages[currentPageIndex]
  const extractedTextCount = currentPage?.elements.filter(
    (el) => el.type === 'text' && el.data.isExtracted
  ).length || 0

  const allExtractedTextCount = document.pages.reduce(
    (count, page) =>
      count + page.elements.filter((el) => el.type === 'text' && el.data.isExtracted).length,
    0
  )

  const handleApply = () => {
    onApplyOffset(offset, applyToAll)
    onOpenChange(false)
    setOffset(0)
  }

  const calculatePresetOffset = (percentage: number) => {
    const avgFontSize = 12
    return avgFontSize * percentage
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Fine-Tune Text Alignment</DialogTitle>
          <DialogDescription>
            Adjust the vertical position of extracted text elements to perfect the alignment with the original PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="offset-slider" className="text-sm font-medium">
                Baseline Offset: {offset.toFixed(1)}px
              </Label>
              <Input
                type="number"
                value={offset.toFixed(1)}
                onChange={(e) => setOffset(Number(e.target.value))}
                className="w-24 h-8 text-sm"
                step="0.5"
              />
            </div>
            
            <Slider
              id="offset-slider"
              min={-50}
              max={50}
              step={0.5}
              value={[offset]}
              onValueChange={(value) => setOffset(value[0])}
              className="w-full"
            />

            <div className="grid grid-cols-5 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(calculatePresetOffset(-0.3))}
                className="text-xs"
              >
                -30%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(calculatePresetOffset(-0.2))}
                className="text-xs"
              >
                -20%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(0)}
                className="text-xs"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(calculatePresetOffset(0.2))}
                className="text-xs"
              >
                +20%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(calculatePresetOffset(0.3))}
                className="text-xs"
              >
                +30%
              </Button>
            </div>
          </div>

          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Apply to:</p>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="apply-scope"
                  checked={!applyToAll}
                  onChange={() => setApplyToAll(false)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  Current page only ({extractedTextCount} element{extractedTextCount !== 1 ? 's' : ''})
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="apply-scope"
                  checked={applyToAll}
                  onChange={() => setApplyToAll(true)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  All pages ({allExtractedTextCount} element{allExtractedTextCount !== 1 ? 's' : ''})
                </span>
              </label>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Tip:</strong> Use negative values to move text up, positive values to move text down.
              Start with small adjustments (±2-5px) and fine-tune from there.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={extractedTextCount === 0 && !applyToAll}>
            Apply Offset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
