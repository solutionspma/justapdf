export interface GridSettings {
  enabled: boolean
  size: number
  showGrid: boolean
}

export const DEFAULT_GRID_SETTINGS: GridSettings = {
  enabled: true,
  size: 10,
  showGrid: true
}

export function snapToGrid(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled || gridSize <= 0) {
    return value
  }
  return Math.round(value / gridSize) * gridSize
}

export function snapPointToGrid(
  x: number,
  y: number,
  gridSize: number,
  enabled: boolean
): { x: number; y: number } {
  return {
    x: snapToGrid(x, gridSize, enabled),
    y: snapToGrid(y, gridSize, enabled)
  }
}

export function snapRectToGrid(
  x: number,
  y: number,
  width: number,
  height: number,
  gridSize: number,
  enabled: boolean
): { x: number; y: number; width: number; height: number } {
  if (!enabled) {
    return { x, y, width, height }
  }
  
  return {
    x: snapToGrid(x, gridSize, enabled),
    y: snapToGrid(y, gridSize, enabled),
    width: snapToGrid(width, gridSize, enabled),
    height: snapToGrid(height, gridSize, enabled)
  }
}
