import { Palette, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DocumentColorPalette } from '@/lib/colorPalettes'

interface CurrentPaletteIndicatorProps {
  palette: DocumentColorPalette | null
  onOpenPalettes: () => void
  onClear?: () => void
  className?: string
}

export function CurrentPaletteIndicator({
  palette,
  onOpenPalettes,
  onClear,
  className
}: CurrentPaletteIndicatorProps) {
  if (!palette) {
    return (
      <Button
        onClick={onOpenPalettes}
        variant="outline"
        size="sm"
        className={cn("gap-2", className)}
      >
        <Palette size={16} weight="duotone" />
        <span className="text-xs">Choose Palette</span>
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-sm", className)}>
      <Palette size={16} weight="duotone" className="text-muted-foreground shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{palette.name}</p>
        <div className="flex gap-1 mt-1">
          {Object.entries(palette.colors).slice(0, 6).map(([key, color]) => (
            <div
              key={key}
              className="w-4 h-4 rounded-sm border border-border/50"
              style={{ backgroundColor: color }}
              title={`${key}: ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        <Button
          onClick={onOpenPalettes}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          Change
        </Button>
        {onClear && (
          <Button
            onClick={onClear}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
          >
            <X size={14} weight="bold" />
          </Button>
        )}
      </div>
    </div>
  )
}
