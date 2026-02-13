import { X, Trash, TextAlignLeft, TextAlignCenter, TextAlignRight, TextAlignJustify, TextB, TextItalic } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { TextStylePresets, type TextStylePreset } from '@/components/TextStylePresets'
import type { PDFElement } from '@/lib/types'

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Source Sans 3', label: 'Source Sans 3' },
  { value: 'Crimson Pro', label: 'Crimson Pro' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
]

interface PropertiesPanelProps {
  element: PDFElement
  onUpdateElement: (updates: Partial<PDFElement>) => void
  onClose: () => void
}

export function PropertiesPanel({
  element,
  onUpdateElement,
  onClose
}: PropertiesPanelProps) {
  const handleApplyPreset = (preset: TextStylePreset) => {
    onUpdateElement({
      data: {
        ...element.data,
        fontSize: preset.fontSize,
        fontFamily: preset.fontFamily,
        bold: preset.bold,
        italic: preset.italic,
        color: preset.color
      }
    })
  }

  return (
    <div className="w-80 border-l border-border bg-card shrink-0 flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Properties</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={18} weight="bold" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Type
            </Label>
            <p className="text-sm font-medium capitalize">{element.type}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="element-x" className="text-xs">Position X</Label>
            <Input
              id="element-x"
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdateElement({ x: Number(e.target.value) })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="element-y" className="text-xs">Position Y</Label>
            <Input
              id="element-y"
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdateElement({ y: Number(e.target.value) })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="element-width" className="text-xs">Width</Label>
            <Input
              id="element-width"
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onUpdateElement({ width: Number(e.target.value) })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="element-height" className="text-xs">Height</Label>
            <Input
              id="element-height"
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onUpdateElement({ height: Number(e.target.value) })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="element-rotation" className="text-xs">
              Rotation: {element.rotation}°
            </Label>
            <Slider
              id="element-rotation"
              min={0}
              max={360}
              step={15}
              value={[element.rotation]}
              onValueChange={(value) => onUpdateElement({ rotation: value[0] })}
            />
          </div>
        </div>

        {element.type === 'text' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <TextStylePresets 
              element={element}
              onApplyPreset={handleApplyPreset}
            />

            <div className="space-y-2 pt-4 border-t border-border">
              <Label htmlFor="text-content" className="text-xs">Content</Label>
              <Textarea
                id="text-content"
                value={element.data.content}
                onChange={(e) =>
                  onUpdateElement({
                    data: { ...element.data, content: e.target.value }
                  })
                }
                rows={4}
                className="resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-family" className="text-xs">Font Family</Label>
              <Select
                value={element.data.fontFamily || 'Inter'}
                onValueChange={(value) =>
                  onUpdateElement({
                    data: { ...element.data, fontFamily: value }
                  })
                }
              >
                <SelectTrigger id="font-family">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Text Style</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={element.data.bold ? 'default' : 'outline'}
                  onClick={() => onUpdateElement({ data: { ...element.data, bold: !element.data.bold } })}
                  className="flex-1"
                  title="Bold"
                >
                  <TextB size={16} weight="bold" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={element.data.italic ? 'default' : 'outline'}
                  onClick={() => onUpdateElement({ data: { ...element.data, italic: !element.data.italic } })}
                  className="flex-1"
                  title="Italic"
                >
                  <TextItalic size={16} weight="bold" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-size" className="text-xs">
                Font Size: {element.data.fontSize}px
              </Label>
              <Slider
                id="text-size"
                min={8}
                max={72}
                step={1}
                value={[element.data.fontSize]}
                onValueChange={(value) =>
                  onUpdateElement({
                    data: { ...element.data, fontSize: value[0] }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-color" className="text-xs">Color</Label>
              <Input
                id="text-color"
                type="color"
                value={element.data.color}
                onChange={(e) =>
                  onUpdateElement({
                    data: { ...element.data, color: e.target.value }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Text Alignment</Label>
              <div className="grid grid-cols-4 gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant={element.data.align === 'left' || !element.data.align ? 'default' : 'outline'}
                  onClick={() => onUpdateElement({ data: { ...element.data, align: 'left' } })}
                  className="w-full"
                  title="Align Left"
                >
                  <TextAlignLeft size={16} weight="bold" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={element.data.align === 'center' ? 'default' : 'outline'}
                  onClick={() => onUpdateElement({ data: { ...element.data, align: 'center' } })}
                  className="w-full"
                  title="Align Center"
                >
                  <TextAlignCenter size={16} weight="bold" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={element.data.align === 'right' ? 'default' : 'outline'}
                  onClick={() => onUpdateElement({ data: { ...element.data, align: 'right' } })}
                  className="w-full"
                  title="Align Right"
                >
                  <TextAlignRight size={16} weight="bold" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={element.data.align === 'justify' ? 'default' : 'outline'}
                  onClick={() => onUpdateElement({ data: { ...element.data, align: 'justify' } })}
                  className="w-full"
                  title="Justify"
                >
                  <TextAlignJustify size={16} weight="bold" />
                </Button>
              </div>
            </div>

            {element.data.isExtracted && (
              <>
                <div className="space-y-2 pt-4 border-t border-border">
                  <Label htmlFor="baseline-offset" className="text-xs font-semibold">
                    Baseline Offset: {(element.data.baselineOffset || 0).toFixed(1)}px
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Fine-tune vertical alignment for extracted text
                  </p>
                  <Slider
                    id="baseline-offset"
                    min={-50}
                    max={50}
                    step={0.5}
                    value={[element.data.baselineOffset || 0]}
                    onValueChange={(value) =>
                      onUpdateElement({
                        y: element.y - (element.data.baselineOffset || 0) + value[0],
                        data: { ...element.data, baselineOffset: value[0] }
                      })
                    }
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        const newOffset = -element.data.fontSize * 0.2
                        onUpdateElement({ 
                          y: element.y - (element.data.baselineOffset || 0) + newOffset,
                          data: { ...element.data, baselineOffset: newOffset } 
                        })
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
                    >
                      -20%
                    </button>
                    <button
                      onClick={() => {
                        onUpdateElement({ 
                          y: element.y - (element.data.baselineOffset || 0),
                          data: { ...element.data, baselineOffset: 0 } 
                        })
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        const newOffset = element.data.fontSize * 0.2
                        onUpdateElement({ 
                          y: element.y - (element.data.baselineOffset || 0) + newOffset,
                          data: { ...element.data, baselineOffset: newOffset } 
                        })
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
                    >
                      +20%
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <Label htmlFor="letter-spacing" className="text-xs font-semibold">
                    Letter Spacing: {(element.data.letterSpacing || 0).toFixed(3)}px
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Adjust horizontal character spacing for perfect alignment
                  </p>
                  {element.data.pdfWidth && (
                    <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/50 rounded space-y-1">
                      <div className="flex justify-between">
                        <span>PDF Width:</span>
                        <span className="font-mono">{element.data.pdfWidth.toFixed(1)}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Char Width:</span>
                        <span className="font-mono">{(element.data.avgCharWidth || 0).toFixed(2)}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Characters:</span>
                        <span className="font-mono">{element.data.content.length}</span>
                      </div>
                    </div>
                  )}
                  <Slider
                    id="letter-spacing"
                    min={-10}
                    max={10}
                    step={0.01}
                    value={[element.data.letterSpacing || 0]}
                    onValueChange={(value) =>
                      onUpdateElement({
                        data: { ...element.data, letterSpacing: value[0] }
                      })
                    }
                  />
                  <div className="grid grid-cols-5 gap-1.5 mt-2">
                    <button
                      onClick={() => {
                        const current = element.data.letterSpacing || 0
                        onUpdateElement({ data: { ...element.data, letterSpacing: current - 1 } })
                      }}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.letterSpacing || 0
                        onUpdateElement({ data: { ...element.data, letterSpacing: current - 0.1 } })
                      }}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      -0.1
                    </button>
                    <button
                      onClick={() => onUpdateElement({ data: { ...element.data, letterSpacing: 0 } })}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      0
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.letterSpacing || 0
                        onUpdateElement({ data: { ...element.data, letterSpacing: current + 0.1 } })
                      }}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      +0.1
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.letterSpacing || 0
                        onUpdateElement({ data: { ...element.data, letterSpacing: current + 1 } })
                      }}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      +1
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                    <button
                      onClick={() => {
                        const current = element.data.letterSpacing || 0
                        onUpdateElement({ data: { ...element.data, letterSpacing: current - 0.01 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      -0.01
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.letterSpacing || 0
                        onUpdateElement({ data: { ...element.data, letterSpacing: current - 0.05 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      -0.05
                    </button>
                    <button
                      onClick={() => {
                        if (element.data.pdfWidth && element.data.content.length > 0) {
                          const targetWidth = element.data.pdfWidth
                          const charCount = element.data.content.length
                          const baseCharWidth = element.data.fontSize * 0.6
                          const totalCharWidth = baseCharWidth * charCount
                          const neededLetterSpacing = (targetWidth - totalCharWidth) / Math.max(1, charCount - 1)
                          onUpdateElement({ 
                            data: { ...element.data, letterSpacing: neededLetterSpacing }
                          })
                        }
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-semibold"
                      disabled={!element.data.pdfWidth}
                      title="Auto-calculate spacing to match PDF width"
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.letterSpacing || 0
                        onUpdateElement({ data: { ...element.data, letterSpacing: current + 0.05 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      +0.05
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.letterSpacing || 0
                        onUpdateElement({ data: { ...element.data, letterSpacing: current + 0.01 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      +0.01
                    </button>
                  </div>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={(element.data.letterSpacing || 0).toFixed(3)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        if (!isNaN(value)) {
                          onUpdateElement({ data: { ...element.data, letterSpacing: value } })
                        }
                      }}
                      step="0.001"
                      className="font-mono text-xs h-8"
                      placeholder="Precise value"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <Label htmlFor="word-spacing" className="text-xs font-semibold">
                    Word Spacing: {(element.data.wordSpacing || 0).toFixed(2)}px
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Adjust space between words independently from letter spacing
                  </p>
                  <Slider
                    id="word-spacing"
                    min={-20}
                    max={50}
                    step={0.1}
                    value={[element.data.wordSpacing || 0]}
                    onValueChange={(value) =>
                      onUpdateElement({
                        data: { ...element.data, wordSpacing: value[0] }
                      })
                    }
                  />
                  <div className="grid grid-cols-5 gap-1.5 mt-2">
                    <button
                      onClick={() => {
                        const current = element.data.wordSpacing || 0
                        onUpdateElement({ data: { ...element.data, wordSpacing: current - 5 } })
                      }}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.wordSpacing || 0
                        onUpdateElement({ data: { ...element.data, wordSpacing: current - 1 } })
                      }}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => onUpdateElement({ data: { ...element.data, wordSpacing: 0 } })}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      0
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.wordSpacing || 0
                        onUpdateElement({ data: { ...element.data, wordSpacing: current + 1 } })
                      }}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.wordSpacing || 0
                        onUpdateElement({ data: { ...element.data, wordSpacing: current + 5 } })
                      }}
                      className="px-2 py-1.5 text-xs rounded bg-muted hover:bg-muted/80 transition-colors font-mono"
                    >
                      +5
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                    <button
                      onClick={() => {
                        const current = element.data.wordSpacing || 0
                        onUpdateElement({ data: { ...element.data, wordSpacing: current - 0.5 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      -0.5
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.wordSpacing || 0
                        onUpdateElement({ data: { ...element.data, wordSpacing: current - 0.1 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      -0.1
                    </button>
                    <button
                      onClick={() => {
                        onUpdateElement({ data: { ...element.data, wordSpacing: element.data.fontSize * 0.25 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-semibold"
                      title="Set to 25% of font size (normal spacing)"
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.wordSpacing || 0
                        onUpdateElement({ data: { ...element.data, wordSpacing: current + 0.1 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      +0.1
                    </button>
                    <button
                      onClick={() => {
                        const current = element.data.wordSpacing || 0
                        onUpdateElement({ data: { ...element.data, wordSpacing: current + 0.5 } })
                      }}
                      className="px-2 py-1.5 text-[10px] rounded bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      +0.5
                    </button>
                  </div>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={(element.data.wordSpacing || 0).toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        if (!isNaN(value)) {
                          onUpdateElement({ data: { ...element.data, wordSpacing: value } })
                        }
                      }}
                      step="0.1"
                      className="font-mono text-xs h-8"
                      placeholder="Precise value"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {element.type === 'image' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="image-opacity" className="text-xs">
                Opacity: {Math.round(element.data.opacity * 100)}%
              </Label>
              <Slider
                id="image-opacity"
                min={0}
                max={1}
                step={0.1}
                value={[element.data.opacity]}
                onValueChange={(value) =>
                  onUpdateElement({
                    data: { ...element.data, opacity: value[0] }
                  })
                }
              />
            </div>
          </div>
        )}

        {element.type === 'highlight' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="highlight-color" className="text-xs">Highlight Color</Label>
              <Input
                id="highlight-color"
                type="color"
                value={element.data.color}
                onChange={(e) =>
                  onUpdateElement({
                    data: { ...element.data, color: e.target.value }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlight-opacity" className="text-xs">
                Opacity: {Math.round(element.data.opacity * 100)}%
              </Label>
              <Slider
                id="highlight-opacity"
                min={0.05}
                max={1}
                step={0.05}
                value={[element.data.opacity]}
                onValueChange={(value) =>
                  onUpdateElement({
                    data: { ...element.data, opacity: value[0] }
                  })
                }
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => onUpdateElement({ data: { ...element.data, opacity: 0.2 } })}
                  className="flex-1 px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
                >
                  20%
                </button>
                <button
                  onClick={() => onUpdateElement({ data: { ...element.data, opacity: 0.4 } })}
                  className="flex-1 px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
                >
                  40%
                </button>
                <button
                  onClick={() => onUpdateElement({ data: { ...element.data, opacity: 0.6 } })}
                  className="flex-1 px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
                >
                  60%
                </button>
                <button
                  onClick={() => onUpdateElement({ data: { ...element.data, opacity: 0.8 } })}
                  className="flex-1 px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
                >
                  80%
                </button>
              </div>
            </div>
          </div>
        )}

        {element.type === 'note' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label htmlFor="note-content" className="text-xs">Note Content</Label>
              <Textarea
                id="note-content"
                value={element.data.content}
                onChange={(e) =>
                  onUpdateElement({
                    data: { ...element.data, content: e.target.value }
                  })
                }
                rows={6}
                className="resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-color" className="text-xs">Note Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: '#FFA726', label: 'Orange' },
                  { value: '#FFEB3B', label: 'Yellow' },
                  { value: '#66BB6A', label: 'Green' },
                  { value: '#42A5F5', label: 'Blue' },
                  { value: '#AB47BC', label: 'Purple' },
                  { value: '#EF5350', label: 'Red' },
                  { value: '#EC407A', label: 'Pink' },
                  { value: '#78909C', label: 'Gray' },
                ].map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="w-full h-10 rounded border-2 transition-all"
                    style={{
                      backgroundColor: color.value,
                      borderColor: element.data.color === color.value ? '#000' : 'transparent'
                    }}
                    onClick={() =>
                      onUpdateElement({
                        data: { ...element.data, color: color.value }
                      })
                    }
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-author" className="text-xs">Author</Label>
              <Input
                id="note-author"
                value={element.data.author || ''}
                onChange={(e) =>
                  onUpdateElement({
                    data: { ...element.data, author: e.target.value }
                  })
                }
                placeholder="Your name"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
