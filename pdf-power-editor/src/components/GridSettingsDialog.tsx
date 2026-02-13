import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { GridSettings } from '@/lib/snapToGrid'

interface GridSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: GridSettings
  onSettingsChange: (settings: GridSettings) => void
}

export function GridSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange
}: GridSettingsDialogProps) {
  const presetSizes = [5, 10, 20, 25, 50]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grid Settings</DialogTitle>
          <DialogDescription>
            Configure snap-to-grid behavior for precise element placement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="snap-enabled">Snap to Grid</Label>
              <p className="text-sm text-muted-foreground">
                Elements snap to grid when moving or resizing
              </p>
            </div>
            <Switch
              id="snap-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) =>
                onSettingsChange({ ...settings, enabled })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-grid">Show Grid</Label>
              <p className="text-sm text-muted-foreground">
                Display grid overlay on canvas
              </p>
            </div>
            <Switch
              id="show-grid"
              checked={settings.showGrid}
              onCheckedChange={(showGrid) =>
                onSettingsChange({ ...settings, showGrid })
              }
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="grid-size">Grid Size (pixels)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="grid-size"
                type="number"
                min="1"
                max="100"
                value={settings.size}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    size: Math.max(1, Math.min(100, parseInt(e.target.value) || 10))
                  })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {presetSizes.map((size) => (
                <Button
                  key={size}
                  variant={settings.size === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSettingsChange({ ...settings, size })}
                >
                  {size}px
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="text-sm font-medium">Keyboard Shortcuts</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><kbd className="px-1.5 py-0.5 bg-background rounded border">G</kbd> Toggle grid visibility</p>
              <p><kbd className="px-1.5 py-0.5 bg-background rounded border">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-background rounded border">G</kbd> Toggle snap to grid</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
