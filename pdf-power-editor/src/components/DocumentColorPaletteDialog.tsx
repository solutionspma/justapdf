import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Palette, Check, Sparkle, Briefcase, PaintBrush, Circle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { 
  DOCUMENT_COLOR_PALETTES, 
  DocumentColorPalette, 
  getPalettesByCategory,
  getContrastColor
} from '@/lib/colorPalettes'
import { toast } from 'sonner'

interface DocumentColorPaletteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPalette: (palette: DocumentColorPalette) => void
  currentPaletteId?: string
}

export function DocumentColorPaletteDialog({
  open,
  onOpenChange,
  onSelectPalette,
  currentPaletteId
}: DocumentColorPaletteDialogProps) {
  const [selectedPalette, setSelectedPalette] = useState<DocumentColorPalette | null>(null)
  const [customPalette, setCustomPalette] = useState<Partial<DocumentColorPalette>>({
    colors: {
      primary: '#1E3A8A',
      secondary: '#3B82F6',
      accent: '#60A5FA',
      text: '#1F2937',
      background: '#FFFFFF',
      border: '#E5E7EB'
    }
  })

  const handleApplyPalette = () => {
    if (selectedPalette) {
      onSelectPalette(selectedPalette)
      toast.success(`Applied ${selectedPalette.name} palette`, {
        description: 'Document colors updated successfully'
      })
      onOpenChange(false)
    }
  }

  const handleApplyCustomPalette = () => {
    if (customPalette.colors) {
      const palette: DocumentColorPalette = {
        id: 'custom-' + Date.now(),
        name: 'Custom Palette',
        description: 'Your custom color scheme',
        category: 'custom',
        colors: customPalette.colors
      }
      onSelectPalette(palette)
      toast.success('Applied custom palette', {
        description: 'Document colors updated successfully'
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette size={24} weight="duotone" className="text-accent" />
            Document Color Palettes
          </DialogTitle>
          <DialogDescription>
            Choose a color palette to apply consistent styling across your document
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="professional" className="gap-2">
              <Briefcase size={16} />
              <span className="hidden sm:inline">Professional</span>
            </TabsTrigger>
            <TabsTrigger value="creative" className="gap-2">
              <PaintBrush size={16} />
              <span className="hidden sm:inline">Creative</span>
            </TabsTrigger>
            <TabsTrigger value="vibrant" className="gap-2">
              <Sparkle size={16} />
              <span className="hidden sm:inline">Vibrant</span>
            </TabsTrigger>
            <TabsTrigger value="minimal" className="gap-2">
              <Circle size={16} />
              <span className="hidden sm:inline">Minimal</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Palette size={16} />
              <span className="hidden sm:inline">Custom</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="professional" className="space-y-4 mt-4">
            <PaletteGrid
              palettes={getPalettesByCategory('professional')}
              selectedPalette={selectedPalette}
              currentPaletteId={currentPaletteId}
              onSelectPalette={setSelectedPalette}
            />
          </TabsContent>

          <TabsContent value="creative" className="space-y-4 mt-4">
            <PaletteGrid
              palettes={getPalettesByCategory('creative')}
              selectedPalette={selectedPalette}
              currentPaletteId={currentPaletteId}
              onSelectPalette={setSelectedPalette}
            />
          </TabsContent>

          <TabsContent value="vibrant" className="space-y-4 mt-4">
            <PaletteGrid
              palettes={getPalettesByCategory('vibrant')}
              selectedPalette={selectedPalette}
              currentPaletteId={currentPaletteId}
              onSelectPalette={setSelectedPalette}
            />
          </TabsContent>

          <TabsContent value="minimal" className="space-y-4 mt-4">
            <PaletteGrid
              palettes={getPalettesByCategory('minimal')}
              selectedPalette={selectedPalette}
              currentPaletteId={currentPaletteId}
              onSelectPalette={setSelectedPalette}
            />
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create your own custom color palette by selecting colors for each element
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  label="Primary Color"
                  value={customPalette.colors?.primary || '#1E3A8A'}
                  onChange={(color) => setCustomPalette(prev => ({
                    ...prev,
                    colors: { ...prev.colors!, primary: color }
                  }))}
                />
                <ColorInput
                  label="Secondary Color"
                  value={customPalette.colors?.secondary || '#3B82F6'}
                  onChange={(color) => setCustomPalette(prev => ({
                    ...prev,
                    colors: { ...prev.colors!, secondary: color }
                  }))}
                />
                <ColorInput
                  label="Accent Color"
                  value={customPalette.colors?.accent || '#60A5FA'}
                  onChange={(color) => setCustomPalette(prev => ({
                    ...prev,
                    colors: { ...prev.colors!, accent: color }
                  }))}
                />
                <ColorInput
                  label="Text Color"
                  value={customPalette.colors?.text || '#1F2937'}
                  onChange={(color) => setCustomPalette(prev => ({
                    ...prev,
                    colors: { ...prev.colors!, text: color }
                  }))}
                />
                <ColorInput
                  label="Background Color"
                  value={customPalette.colors?.background || '#FFFFFF'}
                  onChange={(color) => setCustomPalette(prev => ({
                    ...prev,
                    colors: { ...prev.colors!, background: color }
                  }))}
                />
                <ColorInput
                  label="Border Color"
                  value={customPalette.colors?.border || '#E5E7EB'}
                  onChange={(color) => setCustomPalette(prev => ({
                    ...prev,
                    colors: { ...prev.colors!, border: color }
                  }))}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg border border-border">
                <Label className="text-sm font-medium mb-3 block">Preview</Label>
                <div className="flex gap-2">
                  {Object.entries(customPalette.colors || {}).map(([key, color]) => (
                    <div key={key} className="flex-1">
                      <div
                        className="h-16 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs text-center mt-1 capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleApplyCustomPalette} className="w-full gap-2">
                <Check size={16} weight="bold" />
                Apply Custom Palette
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {selectedPalette && (
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button onClick={() => setSelectedPalette(null)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApplyPalette} className="flex-1 gap-2">
              <Check size={16} weight="bold" />
              Apply {selectedPalette.name}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface PaletteGridProps {
  palettes: DocumentColorPalette[]
  selectedPalette: DocumentColorPalette | null
  currentPaletteId?: string
  onSelectPalette: (palette: DocumentColorPalette) => void
}

function PaletteGrid({ palettes, selectedPalette, currentPaletteId, onSelectPalette }: PaletteGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {palettes.map((palette) => (
        <button
          key={palette.id}
          onClick={() => onSelectPalette(palette)}
          className={cn(
            "p-4 rounded-lg border-2 transition-all hover:shadow-lg text-left",
            selectedPalette?.id === palette.id
              ? "border-accent ring-2 ring-accent/50 bg-accent/5"
              : currentPaletteId === palette.id
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-accent/30"
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm">{palette.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{palette.description}</p>
            </div>
            {(selectedPalette?.id === palette.id || currentPaletteId === palette.id) && (
              <Check size={20} weight="bold" className="text-accent shrink-0" />
            )}
          </div>

          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {Object.entries(palette.colors).map(([key, color]) => (
              <div
                key={key}
                className="h-10 rounded border border-border/50 shadow-sm"
                style={{ backgroundColor: color }}
                title={`${key}: ${color}`}
              />
            ))}
          </div>

          {palette.textColors && (
            <div className="space-y-1 pt-2 border-t border-border">
              <Label className="text-xs text-muted-foreground">Text Colors</Label>
              <div className="flex gap-1.5">
                {Object.entries(palette.textColors).map(([key, color]) => (
                  <div
                    key={key}
                    className="flex-1 h-6 rounded border border-border/50 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={`${key}: ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {palette.highlightColors && (
            <div className="space-y-1 pt-2 border-t border-border mt-2">
              <Label className="text-xs text-muted-foreground">Highlight Colors</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(palette.highlightColors).map(([key, color]) => (
                  <div
                    key={key}
                    className="h-6 rounded border border-border/50 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={`${key}: ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

interface ColorInputProps {
  label: string
  value: string
  onChange: (color: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-full h-10 rounded-lg border-2 border-border cursor-pointer hover:border-accent transition-colors"
            style={{ backgroundColor: value }}
          />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 font-mono text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
