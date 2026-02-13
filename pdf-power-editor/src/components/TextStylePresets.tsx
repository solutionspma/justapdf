import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { TextH, TextAa, Article, Star, Palette } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { CustomStylePresetDialog } from './CustomStylePresetDialog'
import type { PDFElement } from '@/lib/types'

export interface TextStylePreset {
  name: string
  icon: React.ReactNode
  fontSize: number
  fontFamily: string
  bold: boolean
  italic: boolean
  color: string
  description: string
}

export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  {
    name: 'Heading',
    icon: <TextH size={18} weight="bold" />,
    fontSize: 28,
    fontFamily: 'Space Grotesk',
    bold: true,
    italic: false,
    color: '#1a1a1a',
    description: 'Large, bold heading for titles'
  },
  {
    name: 'Subheading',
    icon: <TextH size={16} weight="bold" />,
    fontSize: 20,
    fontFamily: 'Space Grotesk',
    bold: true,
    italic: false,
    color: '#2a2a2a',
    description: 'Medium heading for sections'
  },
  {
    name: 'Body',
    icon: <TextAa size={18} weight="regular" />,
    fontSize: 14,
    fontFamily: 'Inter',
    bold: false,
    italic: false,
    color: '#333333',
    description: 'Standard paragraph text'
  },
  {
    name: 'Caption',
    icon: <Article size={16} weight="regular" />,
    fontSize: 11,
    fontFamily: 'Inter',
    bold: false,
    italic: true,
    color: '#666666',
    description: 'Small annotation or label text'
  }
]

interface TextStylePresetsProps {
  element: PDFElement
  onApplyPreset: (preset: TextStylePreset) => void
}

export function TextStylePresets({ element, onApplyPreset }: TextStylePresetsProps) {
  const [customPresets] = useKV<TextStylePreset[]>('custom-text-style-presets', [])
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  
  if (element.type !== 'text') return null

  const currentTextStyle = element.type === 'text' ? {
    fontSize: element.data.fontSize,
    fontFamily: element.data.fontFamily || 'Inter',
    bold: element.data.bold || false,
    italic: element.data.italic || false,
    color: element.data.color
  } : undefined

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Style Presets
          </h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setCustomDialogOpen(true)}
            className="h-7 text-xs"
          >
            <Palette size={14} className="mr-1.5" />
            Manage
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {TEXT_STYLE_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              type="button"
              variant="outline"
              onClick={() => onApplyPreset(preset)}
              className="flex flex-col items-start gap-1.5 h-auto p-3 hover:bg-accent/50 transition-colors"
              title={preset.description}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="text-muted-foreground">
                  {preset.icon}
                </div>
                <span className="text-sm font-medium">{preset.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground text-left leading-tight">
                {preset.fontSize}px · {preset.fontFamily}
              </div>
            </Button>
          ))}
        </div>
        
        {customPresets && customPresets.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Custom Presets</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {customPresets.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  onClick={() => onApplyPreset(preset)}
                  className="flex flex-col items-start gap-1.5 h-auto p-3 hover:bg-primary/10 transition-colors border-primary/30"
                  title={preset.description || `Apply ${preset.name}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Star size={16} weight="fill" className="text-primary" />
                    <span className="text-sm font-medium truncate">{preset.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-left leading-tight">
                    {preset.fontSize}px · {preset.fontFamily}
                  </div>
                </Button>
              ))}
            </div>
          </>
        )}
        
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Click a preset to instantly apply the style to your text element
        </p>
      </div>

      <CustomStylePresetDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        currentTextStyle={currentTextStyle}
        onApplyPreset={onApplyPreset}
      />
    </>
  )
}
