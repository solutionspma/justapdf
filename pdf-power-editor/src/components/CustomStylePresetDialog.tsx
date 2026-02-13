import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, Palette, FloppyDisk, Trash, Star } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { TextStylePreset } from './TextStylePresets'

interface CustomStylePresetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTextStyle?: {
    fontSize: number
    fontFamily: string
    bold: boolean
    italic: boolean
    color: string
  }
  onApplyPreset: (preset: TextStylePreset) => void
}

const FONT_FAMILIES = [
  'Space Grotesk',
  'Inter',
  'JetBrains Mono',
  'Roboto',
  'Open Sans',
  'Lora',
  'Playfair Display',
  'Merriweather',
  'Poppins',
  'Montserrat',
  'Source Sans 3',
  'Crimson Pro'
]

export function CustomStylePresetDialog({
  open,
  onOpenChange,
  currentTextStyle,
  onApplyPreset
}: CustomStylePresetDialogProps) {
  const [customPresets, setCustomPresets] = useKV<TextStylePreset[]>('custom-text-style-presets', [])
  const [isCreating, setIsCreating] = useState(false)
  const [editingPresetName, setEditingPresetName] = useState<string | null>(null)
  
  const [newPreset, setNewPreset] = useState<Omit<TextStylePreset, 'icon'>>({
    name: '',
    fontSize: currentTextStyle?.fontSize || 14,
    fontFamily: currentTextStyle?.fontFamily || 'Inter',
    bold: currentTextStyle?.bold || false,
    italic: currentTextStyle?.italic || false,
    color: currentTextStyle?.color || '#333333',
    description: ''
  })

  const handleCreatePreset = () => {
    if (!newPreset.name.trim()) {
      toast.error('Please enter a preset name')
      return
    }

    const preset: TextStylePreset = {
      ...newPreset,
      icon: <Star size={18} weight="fill" />
    }

    setCustomPresets((current) => {
      const presets = current || []
      if (editingPresetName) {
        return presets.map(p => p.name === editingPresetName ? preset : p)
      }
      return [...presets, preset]
    })

    toast.success(editingPresetName ? 'Preset updated!' : 'Preset saved!', {
      description: `"${newPreset.name}" is now available`
    })

    setIsCreating(false)
    setEditingPresetName(null)
    setNewPreset({
      name: '',
      fontSize: 14,
      fontFamily: 'Inter',
      bold: false,
      italic: false,
      color: '#333333',
      description: ''
    })
  }

  const handleDeletePreset = (presetName: string) => {
    setCustomPresets((current) => {
      return (current || []).filter(p => p.name !== presetName)
    })
    toast.success('Preset deleted')
  }

  const handleEditPreset = (preset: TextStylePreset) => {
    setNewPreset({
      name: preset.name,
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      bold: preset.bold,
      italic: preset.italic,
      color: preset.color,
      description: preset.description
    })
    setEditingPresetName(preset.name)
    setIsCreating(true)
  }

  const handleApplyAndClose = (preset: TextStylePreset) => {
    onApplyPreset(preset)
    onOpenChange(false)
  }

  const handleCaptureCurrentStyle = () => {
    if (currentTextStyle) {
      setNewPreset({
        ...newPreset,
        fontSize: currentTextStyle.fontSize,
        fontFamily: currentTextStyle.fontFamily,
        bold: currentTextStyle.bold,
        italic: currentTextStyle.italic,
        color: currentTextStyle.color
      })
      toast.info('Current text style captured')
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingPresetName(null)
    setNewPreset({
      name: '',
      fontSize: currentTextStyle?.fontSize || 14,
      fontFamily: currentTextStyle?.fontFamily || 'Inter',
      bold: currentTextStyle?.bold || false,
      italic: currentTextStyle?.italic || false,
      color: currentTextStyle?.color || '#333333',
      description: ''
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette size={24} className="text-primary" />
            Custom Style Presets
          </DialogTitle>
          <DialogDescription>
            Create and manage your own text formatting presets for quick reuse
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full"
              size="lg"
            >
              <Plus size={18} weight="bold" className="mr-2" />
              Create New Preset
            </Button>
          )}

          {isCreating && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingPresetName ? 'Edit Preset' : 'New Preset'}
                </h3>
                {currentTextStyle && !editingPresetName && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCaptureCurrentStyle}
                  >
                    <Palette size={14} className="mr-1.5" />
                    Capture Current Style
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input
                    id="preset-name"
                    placeholder="e.g., My Heading Style"
                    value={newPreset.name}
                    onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preset-font-size">Font Size (px)</Label>
                  <Input
                    id="preset-font-size"
                    type="number"
                    min="8"
                    max="72"
                    value={newPreset.fontSize}
                    onChange={(e) => setNewPreset({ ...newPreset, fontSize: parseInt(e.target.value) || 14 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preset-font-family">Font Family</Label>
                  <Select
                    value={newPreset.fontFamily}
                    onValueChange={(value) => setNewPreset({ ...newPreset, fontFamily: value })}
                  >
                    <SelectTrigger id="preset-font-family">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preset-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="preset-color"
                      type="color"
                      value={newPreset.color}
                      onChange={(e) => setNewPreset({ ...newPreset, color: e.target.value })}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={newPreset.color}
                      onChange={(e) => setNewPreset({ ...newPreset, color: e.target.value })}
                      className="flex-1 font-mono text-sm"
                      placeholder="#333333"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Text Style</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="preset-bold"
                        checked={newPreset.bold}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, bold: checked })}
                      />
                      <Label htmlFor="preset-bold" className="font-bold cursor-pointer">
                        Bold
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="preset-italic"
                        checked={newPreset.italic}
                        onCheckedChange={(checked) => setNewPreset({ ...newPreset, italic: checked })}
                      />
                      <Label htmlFor="preset-italic" className="italic cursor-pointer">
                        Italic
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="preset-description">Description (Optional)</Label>
                  <Input
                    id="preset-description"
                    placeholder="e.g., Use for main section headings"
                    value={newPreset.description}
                    onChange={(e) => setNewPreset({ ...newPreset, description: e.target.value })}
                  />
                </div>
              </div>

              <div 
                className="p-4 rounded border bg-background"
                style={{
                  fontFamily: newPreset.fontFamily,
                  fontSize: newPreset.fontSize,
                  fontWeight: newPreset.bold ? 'bold' : 'normal',
                  fontStyle: newPreset.italic ? 'italic' : 'normal',
                  color: newPreset.color
                }}
              >
                Preview: The quick brown fox jumps over the lazy dog
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePreset}
                  className="flex-1"
                >
                  <FloppyDisk size={18} weight="bold" className="mr-2" />
                  {editingPresetName ? 'Update Preset' : 'Save Preset'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
              Your Custom Presets ({customPresets?.length || 0})
            </h3>
            
            {(!customPresets || customPresets.length === 0) && !isCreating && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Star size={48} weight="fill" className="mb-3 opacity-20" />
                <p className="text-sm">No custom presets yet</p>
                <p className="text-xs mt-1">Create your first preset to get started</p>
              </div>
            )}

            {customPresets && customPresets.length > 0 && (
              <ScrollArea className="flex-1 -mx-2 px-2">
                <div className="space-y-2">
                  {customPresets.map((preset) => (
                    <div
                      key={preset.name}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/30 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Star size={16} weight="fill" className="text-primary flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{preset.name}</span>
                        </div>
                        <div 
                          className="text-xs truncate"
                          style={{
                            fontFamily: preset.fontFamily,
                            fontSize: '12px',
                            fontWeight: preset.bold ? 'bold' : 'normal',
                            fontStyle: preset.italic ? 'italic' : 'normal',
                            color: preset.color
                          }}
                        >
                          {preset.fontSize}px · {preset.fontFamily} · {preset.color}
                        </div>
                        {preset.description && (
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {preset.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApplyAndClose(preset)}
                          title="Apply this preset"
                        >
                          Apply
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditPreset(preset)}
                          title="Edit preset"
                        >
                          <Palette size={16} />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePreset(preset.name)}
                          title="Delete preset"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
