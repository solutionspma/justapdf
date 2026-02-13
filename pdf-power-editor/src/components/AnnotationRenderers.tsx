import type { ArrowElement, ShapeElement, StampElement } from '@/lib/types'

interface ArrowRendererProps {
  element: ArrowElement
  isSelected: boolean
  onClick: () => void
}

export function ArrowRenderer({ element, isSelected, onClick }: ArrowRendererProps) {
  const { startX, startY, endX, endY, color, strokeWidth, arrowheadSize, style } = element.data
  
  const dx = endX - startX
  const dy = endY - startY
  const angle = Math.atan2(dy, dx)
  
  const arrowPoint1X = endX - arrowheadSize * Math.cos(angle - Math.PI / 6)
  const arrowPoint1Y = endY - arrowheadSize * Math.sin(angle - Math.PI / 6)
  const arrowPoint2X = endX - arrowheadSize * Math.cos(angle + Math.PI / 6)
  const arrowPoint2Y = endY - arrowheadSize * Math.sin(angle + Math.PI / 6)
  
  const minX = Math.min(element.x, element.x + element.width)
  const minY = Math.min(element.y, element.y + element.height)
  const width = Math.abs(element.width)
  const height = Math.abs(element.height)
  
  let strokeDasharray = ''
  if (style === 'dashed') strokeDasharray = '10,5'
  if (style === 'dotted') strokeDasharray = '2,4'
  
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: minX,
        top: minY,
        width,
        height,
        cursor: 'pointer',
        zIndex: element.zIndex,
      }}
    >
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <line
          x1={startX - minX}
          y1={startY - minY}
          x2={endX - minX}
          y2={endY - minY}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
        <polygon
          points={`${endX - minX},${endY - minY} ${arrowPoint1X - minX},${arrowPoint1Y - minY} ${arrowPoint2X - minX},${arrowPoint2Y - minY}`}
          fill={color}
        />
        {isSelected && (
          <rect
            x={-2}
            y={-2}
            width={width + 4}
            height={height + 4}
            fill="none"
            stroke="oklch(0.65 0.18 200)"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
      </svg>
    </div>
  )
}

interface ShapeRendererProps {
  element: ShapeElement
  isSelected: boolean
  onClick: () => void
}

export function ShapeRenderer({ element, isSelected, onClick }: ShapeRendererProps) {
  const { shapeType, color, fillColor, strokeWidth, filled, opacity } = element.data
  
  const renderShape = () => {
    const commonProps = {
      stroke: color,
      strokeWidth,
      fill: filled ? (fillColor || color) : 'none',
      opacity,
    }
    
    switch (shapeType) {
      case 'rectangle':
        return (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={element.width - strokeWidth}
            height={element.height - strokeWidth}
            {...commonProps}
          />
        )
      case 'circle':
        return (
          <ellipse
            cx={element.width / 2}
            cy={element.height / 2}
            rx={element.width / 2 - strokeWidth / 2}
            ry={element.height / 2 - strokeWidth / 2}
            {...commonProps}
          />
        )
      case 'line':
        return (
          <line
            x1={0}
            y1={element.height / 2}
            x2={element.width}
            y2={element.height / 2}
            {...commonProps}
          />
        )
      case 'triangle':
        const points = `${element.width / 2},${strokeWidth} ${element.width - strokeWidth},${element.height - strokeWidth} ${strokeWidth},${element.height - strokeWidth}`
        return <polygon points={points} {...commonProps} />
      default:
        return null
    }
  }
  
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: 'pointer',
        zIndex: element.zIndex,
        transform: `rotate(${element.rotation}deg)`,
      }}
    >
      <svg width={element.width} height={element.height}>
        {renderShape()}
        {isSelected && (
          <rect
            x={0}
            y={0}
            width={element.width}
            height={element.height}
            fill="none"
            stroke="oklch(0.65 0.18 200)"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
      </svg>
    </div>
  )
}

interface StampRendererProps {
  element: StampElement
  isSelected: boolean
  onClick: () => void
}

export function StampRenderer({ element, isSelected, onClick }: StampRendererProps) {
  const { stampType, text, color, rotation } = element.data
  
  const getStampStyle = () => {
    const baseStyle = {
      border: `3px solid ${color}`,
      borderRadius: '8px',
      padding: '8px 16px',
      fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: 'bold',
      fontSize: '20px',
      color,
      textTransform: 'uppercase' as const,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      userSelect: 'none' as const,
    }
    
    switch (stampType) {
      case 'approved':
        return { ...baseStyle, color: 'oklch(0.60 0.20 145)', border: '3px solid oklch(0.60 0.20 145)' }
      case 'rejected':
        return { ...baseStyle, color: 'oklch(0.55 0.22 25)', border: '3px solid oklch(0.55 0.22 25)' }
      case 'confidential':
        return { ...baseStyle, color: 'oklch(0.45 0.18 25)', border: '3px solid oklch(0.45 0.18 25)' }
      case 'draft':
        return { ...baseStyle, color: 'oklch(0.60 0.15 250)', border: '3px solid oklch(0.60 0.15 250)' }
      case 'final':
        return { ...baseStyle, color: 'oklch(0.45 0.15 250)', border: '3px solid oklch(0.45 0.15 250)' }
      case 'reviewed':
        return { ...baseStyle, color: 'oklch(0.65 0.18 290)', border: '3px solid oklch(0.65 0.18 290)' }
      case 'void':
        return { ...baseStyle, color: 'oklch(0.50 0.01 250)', border: '3px solid oklch(0.50 0.01 250)' }
      case 'copy':
        return { ...baseStyle, color: 'oklch(0.60 0.15 200)', border: '3px solid oklch(0.60 0.15 200)' }
      default:
        return baseStyle
    }
  }
  
  const displayText = text || stampType.toUpperCase()
  
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        cursor: 'pointer',
        zIndex: element.zIndex,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div
        style={{
          ...getStampStyle(),
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {displayText}
      </div>
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            border: '2px dashed oklch(0.65 0.18 200)',
            pointerEvents: 'none',
            borderRadius: '8px',
          }}
        />
      )}
    </div>
  )
}
