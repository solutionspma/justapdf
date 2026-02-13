import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Palette } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ColorPresetsProps {
  value: string
  onChange: (color: string) => void
  opacity?: number
  onOpacityChange?: (opacity: number) => void
  showOpacity?: boolean
}

const COLOR_PRESETS = [
  { name: 'Yellow', color: '#FFEB3B', textColor: '#000' },
  { name: 'Green', color: '#4CAF50', textColor: '#FFF' },
  { name: 'Blue', color: '#2196F3', textColor: '#FFF' },
  { name: 'Orange', color: '#FF9800', textColor: '#000' },
  { name: 'Pink', color: '#E91E63', textColor: '#FFF' },
  { name: 'Purple', color: '#9C27B0', textColor: '#FFF' },
  { name: 'Red', color: '#F44336', textColor: '#FFF' },
  { name: 'Cyan', color: '#00BCD4', textColor: '#000' },
  { name: 'Lime', color: '#CDDC39', textColor: '#000' },
  { name: 'Amber', color: '#FFC107', textColor: '#000' }
]

export function ColorPresets({ 
  value, 
  onChange, 
  opacity = 0.4, 
  onOpacityChange, 
  showOpacity = false 
}: ColorPresetsProps) {
  const rgbaValue = showOpacity && opacity !== undefined
    ? hexToRgba(value, opacity)
    : value

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <div
            className="w-4 h-4 rounded border border-border"
            style={{ backgroundColor: rgbaValue }}
          />
          <Palette size={16} />
          <span className="text-xs">Color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          <p className="text-sm font-medium">Quick Colors</p>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                className={cn(
                  "w-10 h-10 rounded-lg border-2 transition-all hover:scale-110",
                  value === preset.color ? "border-foreground ring-2 ring-accent" : "border-transparent"
                )}
                style={{ 
                  backgroundColor: showOpacity && opacity !== undefined 
                    ? hexToRgba(preset.color, opacity) 
                    : preset.color 
                }}
                onClick={() => onChange(preset.color)}
                title={preset.name}
              />
            ))}
          </div>
          
          {showOpacity && onOpacityChange && (
            <div className="pt-2 border-t border-border space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium">Opacity Slider</Label>
                  <span className="text-xs font-mono font-semibold text-foreground">{Math.round(opacity * 100)}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={([val]) => onOpacityChange(val)}
                  min={0.1}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="text-xs font-medium mb-2 block">Quick Presets</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 0.15, label: '15%', desc: 'Very Light' },
                    { value: 0.25, label: '25%', desc: 'Light' },
                    { value: 0.35, label: '35%', desc: 'Medium' },
                    { value: 0.5, label: '50%', desc: 'Bold' },
                    { value: 0.7, label: '70%', desc: 'Strong' }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => onOpacityChange(preset.value)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all hover:scale-105",
                        Math.abs(opacity - preset.value) < 0.01 
                          ? "border-accent ring-2 ring-accent/50 bg-accent/10" 
                          : "border-border hover:border-accent/50"
                      )}
                      title={preset.desc}
                    >
                      <div 
                        className="w-full h-6 rounded mb-1 border border-border/50"
                        style={{ backgroundColor: hexToRgba(value, preset.value) }}
                      />
                      <span className="text-[10px] font-medium">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-xs font-medium mb-2 block">Readability</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 0.2, label: 'High', icon: '📖' },
                    { value: 0.4, label: 'Medium', icon: '📄' },
                    { value: 0.6, label: 'Low', icon: '🔍' }
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => onOpacityChange(preset.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:scale-105",
                        Math.abs(opacity - preset.value) < 0.01 
                          ? "border-accent ring-2 ring-accent/50 bg-accent/10" 
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <span className="text-lg">{preset.icon}</span>
                      <span className="text-[10px] font-medium">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t border-border">
            <label className="text-xs font-medium mb-2 block">Custom Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-24 h-10 px-2 text-xs border border-border rounded"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
