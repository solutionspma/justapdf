interface GridOverlayProps {
  width: number
  height: number
  zoom: number
  gridSize: number
  show: boolean
}

export function GridOverlay({ width, height, zoom, gridSize, show }: GridOverlayProps) {
  if (!show) return null

  const scaledGridSize = gridSize * zoom

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{
        width: width * zoom,
        height: height * zoom
      }}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={scaledGridSize}
          height={scaledGridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${scaledGridSize} 0 L 0 0 0 ${scaledGridSize}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/20"
          />
        </pattern>
        <pattern
          id="grid-pattern-major"
          width={scaledGridSize * 5}
          height={scaledGridSize * 5}
          patternUnits="userSpaceOnUse"
        >
          <rect
            width={scaledGridSize * 5}
            height={scaledGridSize * 5}
            fill="url(#grid-pattern)"
          />
          <path
            d={`M ${scaledGridSize * 5} 0 L 0 0 0 ${scaledGridSize * 5}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary/30"
          />
        </pattern>
      </defs>
      <rect
        width={width * zoom}
        height={height * zoom}
        fill="url(#grid-pattern-major)"
      />
    </svg>
  )
}
